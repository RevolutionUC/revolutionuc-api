import {
  Body,
  Controller,
  Get,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JudgeService } from './judge.service';
import { UseAuth } from '../../auth/auth.decorator';
import { CurrentUser, CurrentUserDto } from '../../auth/currentuser';
import { Judge } from '../entities/judge.entity';

@ApiTags('admin')
@Controller('v2/judging/judge')
@UseAuth([`JUDGE`])
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Get(`me`)
  getJudgeDetails(@CurrentUser() user: CurrentUserDto): Promise<Judge> {
    return this.judgeService.getJudgeDetails(user.id);
  }

  @Put(`rankings`)
  rankSubmissions(@CurrentUser() user: CurrentUserDto, @Body() data: { rankings: Array<string> }): Promise<Judge> {
    return this.judgeService.rankSubmissions(user.id, data.rankings);
  }

  @Put(`isFinal`)
  submitRanking(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.judgeService.submitRanking(user.id);
  }
}
