import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // judges
  async getJudges(): Promise<Array<Judge>> {
    return this.judgeRepository.find();
  }

  async createJudge({ name, email }: JudgeDto): Promise<Judge> {
    const judge = this.judgeRepository.create({ name, email });
    return this.judgeRepository.save(judge);
  }

  async deleteJudge(id: string): Promise<void> {
    await this.judgeRepository.delete(id);
    return;
  }

  // projects
  private async createProject(data: ProjectDto): Promise<Project> {
    const project = this.projectRepository.create(data);
    return this.projectRepository.save(project);
  }

  private async createProjects(data: Array<ProjectDto>): Promise<Array<Project>> {
    return Promise.all(data.map(project => this.createProject(project)));
  }

  async uploadCsv(file: Express.Multer.File): Promise<Array<Project>> {
    const csvString = file.buffer.toString();
    const config = await this.configRepository.findOne({ year: 2021 });
    const projects = devpostParser(csvString, config);
    return this.createProjects(projects);
  }

  async listProjects(): Promise<Array<Project>> {
    return this.projectRepository.find();
  }

  // config
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

  // prizing
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
}
