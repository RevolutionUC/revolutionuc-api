import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import csvToJson from 'csvjson-csv2json';
import { JudgeDto } from '../dtos/judge.dto';
import { ProjectDto } from '../dtos/project.dto';
import { Judge } from '../entities/judge.entity';
import { Project } from '../entities/project.entity';
import { JudgingConfig } from '../entities/config.entity';
import { JudgingConfigDto } from '../dtos/config.dto';
import { devpostParser } from './util/devpost-export-parser';
import { Category } from '../entities/category.entity';
import { Submission } from '../entities/submission.entity';

const scoreRanks = [ 5, 4, 3, 2, 1 ];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(JudgingConfig) private readonly configRepository: Repository<JudgingConfig>,
    @InjectRepository(Judge) private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>
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
    return this.judgeRepository.find();
  }

  async createJudge({ name, email, category: categoryName = `General` }: JudgeDto): Promise<Judge> {
    const category = await this.categoryRepository.findOneOrFail({ name: categoryName });
    const judge = this.judgeRepository.create({ name, email, category });
    return this.judgeRepository.save(judge);
  }

  async uploadJudgesCsv(file: Express.Multer.File): Promise<Array<Judge>> {
    const csvString = file.buffer.toString();
    const json: JudgeDto[] = csvToJson(csvString);
    return Promise.all(json.map(judge => this.createJudge(judge)));
  }

  async assignJudgeToCategory(judgeId: string, categoryId: string): Promise<Judge> {
    const category = await this.categoryRepository.findOneOrFail(categoryId);
    const judge = await this.judgeRepository.findOneOrFail(judgeId);

    judge.category = category;

    return this.judgeRepository.save(judge);
  };

  async deleteJudge(id: string): Promise<void> {
    await this.judgeRepository.delete(id);
  }

  //#endregion

  //#region projects
  private createSubmissionsForProject({ categories: categoryNames, ...data }: ProjectDto, allCategories: Array<Category>): Array<Submission> {
    const project = this.projectRepository.create(data);
    const categories = allCategories.filter(category => categoryNames.includes(category.name));
    const submissions = categories.map(category => this.submissionRepository.create({ project, category }));
    return submissions;
  }

  private async createSubmissions(data: Array<ProjectDto>, allCategories: Array<Category>): Promise<Array<Submission>> {
    const allSubmissions: Array<Submission> = [];

    data.forEach(
      project => allSubmissions.push(...this.createSubmissionsForProject(project, allCategories))
    );

    return this.submissionRepository.save(allSubmissions);
  }

  async uploadDevpostCsv(file: Express.Multer.File): Promise<Array<Submission>> {
    const csvString = file.buffer.toString();
    const config = await this.configRepository.findOneOrFail({ year: 2021 });
    const allCategories = await this.categoryRepository.find();
    const projects = devpostParser(csvString, config);
    return this.createSubmissions(projects, allCategories);
  }

  async getProjects(): Promise<Array<Project>> {
    return this.projectRepository.find({ relations: [`submissions`, `submissions.category`] });
  }

  //#endregion

  //#region config
  async updateConfig(data: JudgingConfigDto): Promise<JudgingConfig> {
    const existingConfig = await this.configRepository.findOne({ year: data.year });

    let config: JudgingConfigDto;

    if(existingConfig) {
      config = { ...existingConfig, ...data };
    } else {
      config = this.configRepository.create(data);
    }

    return this.configRepository.save(config);
  }

  async generateGroups(): Promise<void> {
    
  }

  //#endregion

  //#region prizing
  private async scoreSubmissions(): Promise<void> {
    const submissions = await this.submissionRepository.find();
    const judges = await this.judgeRepository.find();

    judges.forEach(judge => {
      judge.rankings.forEach((submissionId, i) => {
        const submission = submissions.find(({ id }) => id === submissionId);
        submission.score += scoreRanks[i];
      });
    });

    const jobs = submissions.map(submission => {
      if(submission.score) {
        return this.submissionRepository.save(submission);
      }
    });

    await Promise.all(jobs);
  }

  //#endregion
}
