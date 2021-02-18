import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UseAuth } from '../../auth/auth.decorator';
import { SendEmailDto } from '../../email/email.service';
import { JudgeDto } from '../dtos/judge.dto';
import { JudgingConfigDto } from '../dtos/config.dto';
import { Judge } from '../entities/judge.entity';
import { Submission } from '../entities/submission.entity';
import { Project } from '../entities/project.entity';
import { Category } from '../entities/category.entity';
import { Group } from '../entities/group.entity';
import { JudgingConfig } from '../entities/config.entity';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('v2/judging/admin')
@UseAuth([`SUDO`, `ADMIN`])
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

  @Post(`judge/email`)
  sendEmail(@Body() data: SendEmailDto): Promise<void> {
    return this.adminService.sendEmail(data);
  }

  @Get(`project`)
  getProjects(): Promise<Array<Project>> {
    return this.adminService.getProjects();
  }

  @Post(`devpost`)
  @UseInterceptors(FileInterceptor('file'))
  uploadDevpostCsv(@UploadedFile() file: Express.Multer.File): Promise<Array<Submission>> {
    return this.adminService.uploadDevpostCsv(file);
  }

  @Get(`category`)
  getCategories(): Promise<Array<Category>> {
    return this.adminService.getCategories();
  }

  @Get(`group`)
  getGroups(): Promise<Array<Group>> {
    return this.adminService.getGroups();
  }

  @Post(`assignment`)
  initiateAssignment(): Promise<Array<Group>> {
    return this.adminService.initiateAssignment();
  }

  @Get(`config`)
  getConfig(): Promise<JudgingConfig> {
    return this.adminService.getConfig();
  }

  @Put(`config`)
  updateConfig(@Body() config: JudgingConfigDto): Promise<JudgingConfig> {
    return this.adminService.updateConfig(config);
  }

  @Get(`prizing`)
  getPrizingInfo(): Promise<Array<Submission>> {
    return this.adminService.getPrizingInfo();
  }

  @Post(`prizing`)
  scoreSubmissions(): Promise<void> {
    return this.adminService.scoreSubmissions();
  }
}
