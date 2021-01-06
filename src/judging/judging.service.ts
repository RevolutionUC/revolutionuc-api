import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeDto } from './dtos/judge.dto';
import { ProjectDto } from './dtos/project.dto';
import { Judge } from './entities/judge.entity';
import { Project } from './entities/project.entity';

@Injectable()
export class JudgingService {
  constructor(
    @InjectRepository(Judge) private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>
  ) {}

  private async createProject(data: ProjectDto): Promise<Project> {
    const project = this.projectRepository.create(data);
    return this.projectRepository.save(project);
  }

  async getJudges(): Promise<Array<Judge>> {
    return this.judgeRepository.find();
  }

  async createJudge(data: JudgeDto): Promise<Judge> {
    const judge = this.judgeRepository.create(data);
    return this.judgeRepository.save(judge);
  }

  async deleteJudge(id: string): Promise<void> {
    await this.judgeRepository.delete(id);
    return;
  }

  async createProjects(data: Array<ProjectDto>): Promise<Array<Project>> {
    return Promise.all(data.map(project => this.createProject(project)));
  }

  async listProjects(userId?: string): Promise<Array<Project>> {
    if(userId) {
      const judge = await this.judgeRepository.findOne({ userId });

      if(judge?.category !== `general`) {
        return this.projectRepository.find({ category: judge.category });
      }
    }

    return this.projectRepository.find();
  }

  async rankProject(userId: string, rankings: Array<string>): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({ userId });
    const projects = await Promise.all(
      rankings.map(projectId => this.projectRepository.findOneOrFail(projectId))
    );

    judge.rankings = projects.map(project => project.id);

    this.judgeRepository.save(judge);
  }
}
