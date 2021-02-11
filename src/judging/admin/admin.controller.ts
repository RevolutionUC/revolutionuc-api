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
  Put,
  Delete
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UseAuth } from '../../auth/auth.decorator';
import { Judge } from '../entities/judge.entity';
import { JudgeDto } from '../dtos/judge.dto';

@ApiTags('admin')
@Controller('v2/judging/admin')
@UseAuth([`SUDO`, `JUDGE`])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(`judge`)
  getJudges(): Promise<Array<Judge>> {
    return this.adminService.getJudges();
  }

  @Post(`judge`)
  createJudge(@Body() judge: JudgeDto): Promise<Judge> {
    return this.adminService.createJudge(judge);
  }

  @Delete(`judge/:id`)
  deleteJudge(@Param(`id`) id: string): Promise<void> {
    return this.adminService.deleteJudge(id);
  }
}
