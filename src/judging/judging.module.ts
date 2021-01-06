import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Project } from './entities/project.entity';
import { Judge } from './entities/judge.entity';
import { JudgeController } from './judge/judge.controller';
import { AdminController } from './admin/admin.controller';
import { JudgeService } from './judge/judge.service';
import { AdminService } from './admin/admin.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Judge]), AuthModule, EmailModule],
  controllers: [JudgeController, AdminController],
  providers: [JudgeService, AdminService]
})
export class JudgingModule {}
