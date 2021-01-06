import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeDto } from '../dtos/judge.dto';
import { ProjectDto } from '../dtos/project.dto';
import { Judge } from '../entities/judge.entity';
import { Project } from '../entities/project.entity';

@Injectable()
export class AdminService {
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

  async listProjects(): Promise<Array<Project>> {
    return this.projectRepository.find();
  }
}
