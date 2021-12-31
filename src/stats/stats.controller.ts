import { Controller, Get } from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
import { DailyUpdateService } from './daily-update.service';
import { StatsService } from './stats.service';

@ApiTags('stats')
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

  @Get('lattice')
  async getLatticeStats() {
    return this.statsService.getLatticeStats();
  }
}