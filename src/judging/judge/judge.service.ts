import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeDto } from '../dtos/judge.dto';
import { ProjectDto } from '../dtos/project.dto';
import { Judge } from '../entities/judge.entity';
import { Project } from '../entities/project.entity';

@Injectable()
export class JudgeService {
  constructor(
    @InjectRepository(Judge) private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>
  ) {}

  async getInfo(userId: string): Promise<Judge> {
    return this.judgeRepository.findOne({ userId });
  }

  async listProjects(userId: string): Promise<Array<Project>> {
    const judge = await this.judgeRepository.findOneOrFail({ userId });

    if(judge.category !== `general`) {
      return this.projectRepository.find({ category: judge.category });
    }

    return this.projectRepository.find();
  }

  async rankProject(userId: string, rankings: Array<string>): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({ userId, isFinal: false });

    const projects = await Promise.all(
      rankings.map(projectId => this.projectRepository.findOneOrFail(projectId))
    );

    judge.rankings = projects.map(project => project.id);

    await this.judgeRepository.save(judge);
  }

  async submitRanking(userId: string): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({ userId });

    judge.isFinal = true;

    await this.judgeRepository.save(judge);
  }
}
