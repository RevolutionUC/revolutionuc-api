import { HttpService, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { schedule } from 'node-cron';
import { StatsService } from "./stats.service";

const dailyCron = `0 0 22 * * *`;
const dailyUpdateUrls = process.env.DAILY_UPDATE_URLS;

@Injectable()
export class DailyUpdateService implements OnModuleInit {
  constructor(
    private readonly statsService: StatsService,
    private readonly httpService: HttpService
  ) { }

  onModuleInit(): void {
    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    schedule(dailyCron, () => {
      Logger.log(`Sending daily stat update`);
      this.sendUpdate();
    });
  }

  async sendUpdate() {
    const dto = await this.statsService.getDailyUpdate();

    dailyUpdateUrls.split(',').forEach(url => {
      this.httpService.post(url, dto).subscribe(() => {
        Logger.log(`Daily update sent to ${url}`);
      });
    });
  }
}