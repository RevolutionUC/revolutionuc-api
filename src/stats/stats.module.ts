import { HttpModule, Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { DailyUpdateService } from './daily-update.service';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), HttpModule],
  controllers: [StatsController],
  providers: [StatsService, DailyUpdateService],
})
export class StatsModule { }