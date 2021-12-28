import { Controller, Get } from "@nestjs/common";
import { DailyUpdateService } from './daily-update.service';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly dailyUpdateService: DailyUpdateService
  ) { }

  @Get('registrants')
  async getRegistrants() {
    return this.statsService.getAnonymizedData();
  }

  @Get('dailyUpdate')
  trigerDailyUpdate() {
    return this.dailyUpdateService.sendUpdate();
  }
}