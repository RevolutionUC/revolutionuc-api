import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { JudgeDto } from '../dtos/judge.dto';
import { ProjectDto } from '../dtos/project.dto';
import { Judge } from '../entities/judge.entity';
import { Project } from '../entities/project.entity';
import { JudgingConfig } from '../entities/config.entity';
import { JudgingConfigDto } from '../dtos/config.dto';
import { devpostParser } from './util/devpost-export-parser';
import { Category } from '../entities/category.entity';
import { Submission } from '../entities/submission.entity';
import { AuthService } from '../../auth/auth.service';
import { EmailService, SendEmailDto } from '../../email/email.service';
import { Group } from '../entities/group.entity';
import { assign } from './util/project-to-group-assignment';

const scoreRanks = [5, 4, 3, 2, 1];
const JUDGE_PASSWORD = process.env.JUDGE_PASSWORD;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(JudgingConfig)
    private readonly configRepository: Repository<JudgingConfig>,
    @InjectRepository(Judge)
    private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  //#region categories
  async getCategories(): Promise<Array<Category>> {
    return this.categoryRepository.find();
  }

  async createCategory(name: string): Promise<Category> {
    const category = this.categoryRepository.create({ name });
    return this.categoryRepository.save(category);
  }

  //#endregion

  //#region judges
  async getJudges(): Promise<Array<Judge>> {
    return this.judgeRepository.find({ relations: [`category`] });
  }

  async createJudge({
    name,
    email,
    category: categoryId,
  }: JudgeDto): Promise<Judge> {
    const category = await this.categoryRepository.findOneOrFail(categoryId);
    const { user } = await this.authService.register(
      email,
      JUDGE_PASSWORD,
      `JUDGE`,
    );
    const judge = this.judgeRepository.create({
      name,
      email,
      category,
      userId: user.id,
    });
    return this.judgeRepository.save(judge);
  }

  /* async uploadJudgesCsv(file: Express.Multer.File): Promise<Array<Judge>> {
    const csvString = file.buffer.toString();
    const json: JudgeDto[] = csvToJson(csvString);
    return Promise.all(json.map(judge => this.createJudge(judge)));
  } */

  async assignJudgeToCategory(
    judgeId: string,
    categoryId: string,
  ): Promise<Judge> {
    const category = await this.categoryRepository.findOneOrFail(categoryId);
    const judge = await this.judgeRepository.findOneOrFail(judgeId);

    judge.category = category;

    return this.judgeRepository.save(judge);
  }

  async sendEmail(payload: SendEmailDto): Promise<void> {
    return this.emailService.sendEmail(payload);
  }

  async deleteJudge(id: string): Promise<void> {
    const judge = await this.judgeRepository.findOne(id);
    await this.judgeRepository.remove(judge);
    return this.authService.deleteUser(judge.userId);
  }

  //#endregion

  //#region projects
  private async createSubmissionsForProject(
    { categories: categoryNames, ...data }: ProjectDto,
    allCategories: Array<Category>,
  ): Promise<Array<Submission>> {
    const project = await this.projectRepository.save(
      this.projectRepository.create(data),
    );
    const categories = allCategories.filter((category) =>
      categoryNames.includes(category.name),
    );
    const submissions = categories.map((category) =>
      this.submissionRepository.create({ project, category }),
    );
    return submissions;
  }

  private async createSubmissions(
    projects: Array<ProjectDto>,
    allCategories: Array<Category>,
  ): Promise<Array<Submission>> {
    const allSubmissions: Array<Submission> = [];

    await Promise.all(
      projects.map(async (project) => {
        const submissions = await this.createSubmissionsForProject(
          project,
          allCategories,
        );
        allSubmissions.push(...submissions);
      }),
    );

    return this.submissionRepository.save(allSubmissions);
  }

  async uploadDevpostCsv(
    file: Express.Multer.File,
  ): Promise<Array<Submission>> {
    const csvString = file.buffer.toString();
    const config = await this.configRepository.findOneOrFail({ year: 2021 });
    const allCategories = await this.categoryRepository.find();
    const projects = devpostParser(csvString, config);

    return this.createSubmissions(projects, allCategories);
  }

  async getProjects(): Promise<Array<Project>> {
    return this.projectRepository.find({
      relations: [`submissions`, `submissions.category`],
    });
  }

  async qualifyProject(id: string, disqualified?: string): Promise<void> {
    const project = await this.projectRepository.findOne(id);
    Logger.log(`Qualifyin project ${project.title} with ${disqualified}`);
    project.disqualified = disqualified || null;
    await this.projectRepository.save(project);
  }

  //#endregion

  //#region config
  async getConfig(): Promise<JudgingConfig> {
    return this.configRepository.findOne();
  }

  async updateConfig(updatedConfig: JudgingConfigDto): Promise<JudgingConfig> {
    const existingConfig = await this.configRepository.findOne({
      year: updatedConfig.year,
    });

    let config: JudgingConfigDto;

    if (existingConfig) {
      config = { ...existingConfig, ...updatedConfig };
    } else {
      config = this.configRepository.create(updatedConfig);
    }

    return this.configRepository.save(config);
  }

  //#endregion

  //#region groups

  async getGroups(): Promise<Array<Group>> {
    return this.groupRepository.find({
      relations: [`submissions`, `submissions.project`, `judges`, `category`],
    });
  }

  async initiateAssignment(): Promise<Array<Group>> {
    Logger.log(`initiateAssignment() start`);

    const categories = await this.categoryRepository.find({
      relations: [`judges`, `submissions`],
    });
    const judgingConfig = await this.configRepository.findOne({ year: 2021 });

    Logger.log(
      `initiateAssignment() assigning ${categories.length} categories`,
    );

    const assignments = assign(categories, judgingConfig);

    Logger.log(`initiateAssignment() created ${assignments.length} groups`);

    const groups = this.groupRepository.create(assignments);
    await this.groupRepository.save(groups);
    return this.getGroups();
  }

  //#endregion

  //#region prizing
  async getPrizingInfo(): Promise<Array<Submission>> {
    const judge = await this.judgeRepository.findOne({ isFinal: false });

    if (judge) {
      throw new HttpException(`Judge still deciding`, HttpStatus.BAD_REQUEST);
    }

    const scoredSubmissions = await this.submissionRepository.find({
      where: { score: MoreThan(0) },
      relations: [`project`, `category`],
    });

    if (!scoredSubmissions.length) {
      throw new HttpException(`Scoring not started`, HttpStatus.NOT_FOUND);
    }

    return scoredSubmissions;
  }

  async scoreSubmissions(): Promise<void> {
    const judges = await this.judgeRepository.find();

    const indeterminateJudge = judges.findIndex((j) => !j.isFinal);

    if (indeterminateJudge !== -1) {
      throw new HttpException(`Judge still deciding`, HttpStatus.BAD_REQUEST);
    }

    const submissions = await this.submissionRepository.find({
      relations: [`project`, `category`],
    });

    judges.forEach((judge) => {
      judge.rankings.forEach((submissionId, i) => {
        const submission = submissions.find(({ id }) => id === submissionId);
        Logger.log(
          `${judge.name} ranked ${submission.project.title} at ${i + 1}`,
        );
        submission.score += scoreRanks[i];
      });
    });

    const jobs = submissions.map((submission) => {
      if (submission.score) {
        Logger.log(
          `${submission.project.title}:${submission.category.name} has a score of ${submission.score}`,
        );
        return this.submissionRepository.save(submission);
      }
    });

    await Promise.all(jobs);
  }

  //#endregion
}
