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
import { JudgingService } from './judging.service';
import { UseAuth } from '../auth/auth.decorator';

@ApiTags('admin')
@Controller('v2/admin')
@UseAuth([`SUDO`, `JUDGE`])
export class JudgingController {
  constructor(private readonly judgingService: JudgingService) {}

}
