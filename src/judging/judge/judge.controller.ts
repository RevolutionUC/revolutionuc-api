import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  Patch,
  Req,
  Res,
  Query,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JudgeService } from './judge.service';
import { UseAuth } from '../../auth/auth.decorator';

@ApiTags('admin')
@Controller('v2/judging/judge')
@UseAuth([`SUDO`, `JUDGE`])
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

}
