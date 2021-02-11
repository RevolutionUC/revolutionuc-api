import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Judge } from '../entities/judge.entity';
import { Submission } from '../entities/submission.entity';

@Injectable()
export class JudgeService {
  constructor(
    @InjectRepository(Judge) private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>
  ) {}

  async getInfo(userId: string): Promise<Judge> {
    return this.judgeRepository.findOneOrFail({ userId });
  }

  async getSubmissions(userId: string): Promise<Array<Submission>> {
    const judge = await this.judgeRepository.findOneOrFail({
      where: { userId },
      relations: [`group`, `group.submissions`, `group.submissions.project`]
    });
    return judge.group.submissions;
  }

  async rankSubmissions(userId: string, rankings: Array<string>): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({
      where: { userId, isFinal: false },
      relations: [`group`, `group.submissions`]
    });

    const submissions = rankings.map(
      submissionId => judge.group.submissions.find(({ id }) => id === submissionId)
    );

    judge.rankings = submissions.map(({ id }) => id);

    await this.judgeRepository.save(judge);
  }

  async submitRanking(userId: string): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({ userId });

    judge.isFinal = true;

    await this.judgeRepository.save(judge);
  }
}
