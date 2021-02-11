import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ScoreService } from './score.service';
import { Hacker } from '../entities/hacker.entity';
import { Swipe } from '../entities/swipe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Hacker, Swipe ]),
    AuthModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ScoreService],
})
export class ProfileModule {}
