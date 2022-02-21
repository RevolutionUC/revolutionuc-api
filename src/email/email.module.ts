import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';
import { Judge } from '../judging/entities/judge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant, Judge]), AuthModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
