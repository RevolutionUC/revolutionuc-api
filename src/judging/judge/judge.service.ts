import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Judge } from '../entities/judge.entity';
import { Submission } from '../entities/submission.entity';

@Injectable()
export class JudgeService {
  constructor(
    @InjectRepository(Judge) private readonly judgeRepository: Repository<Judge>,
  ) {}

  async getJudgeDetails(userId: string): Promise<Judge> {
    return this.judgeRepository.findOneOrFail({
      where: { userId },
      relations: [`category`, `group`, `group.submissions`, `group.submissions.project`]
    });
  }

  async getSubmissions(userId: string): Promise<Array<Submission>> {
    const judge = await this.judgeRepository.findOneOrFail({
      where: { userId },
      relations: [`group`, `group.submissions`]
    });
    return judge.group.submissions;
  }

  async rankSubmissions(userId: string, rankings: Array<string>): Promise<Judge> {
    const judge = await this.judgeRepository.findOneOrFail({
      where: { userId, isFinal: false },
      relations: [`group`, `group.submissions`]
    });

    const submissions = rankings.map(
      submissionId => judge.group.submissions.find(({ id }) => id === submissionId)
    );

    judge.rankings = submissions.map(({ id }) => id);

    return this.judgeRepository.save(judge);
  }

  async submitRanking(userId: string): Promise<void> {
    const judge = await this.judgeRepository.findOneOrFail({
      where: { userId },
      relations: [`group`, `group.submissions`, `group.submissions.project`]
    });

    const rankings = judge.rankings.map(
      submissionId => judge.group.submissions.find(({ id }) => id === submissionId)
    );

    if (rankings.findIndex(s => s.project.disqualified) !== -1) {
      throw new HttpException(`One or more of your ranked projects have been disqualified, please refresh the page`, HttpStatus.BAD_REQUEST);
    }
    if (rankings.length > 5) {
      throw new HttpException(`Please only rank your top 5`, HttpStatus.BAD_REQUEST);
    }
    if (rankings.length < 5 && rankings.length !== judge.group.submissions.length) {
      throw new HttpException(`Please rank at-least 5 projects`, HttpStatus.BAD_REQUEST);
    }

    judge.isFinal = true;

    await this.judgeRepository.save(judge);
  }
}
