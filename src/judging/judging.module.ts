import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Registrant } from '../entities/registrant.entity';
import { JudgingController } from './judging.controller';
import { JudgingService } from './judging.service';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), AuthModule],
  controllers: [JudgingController],
  providers: [JudgingService]
})
export class JudgingModule {}
