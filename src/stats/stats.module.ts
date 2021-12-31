import { HttpModule, Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { Hacker } from "../lattice/entities/hacker.entity";
import { Notification } from "../lattice/entities/notification.entity";
import { DailyUpdateService } from './daily-update.service';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant, Hacker, Notification]), HttpModule],
  controllers: [StatsController],
  providers: [StatsService, DailyUpdateService],
})
export class StatsModule { }