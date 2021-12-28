import { HttpService, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { schedule } from 'node-cron';
import { combineLatest } from "rxjs";
import { map, tap } from 'rxjs/operators';
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

    return combineLatest(
      dailyUpdateUrls.split(',').map(url => {
        Logger.log(`Sending daily update to ${url}`);
        return this.httpService.post(url, dto).pipe(
          tap(() => Logger.log(`Sent daily update to ${url}`)),
          map(() => url)
        );
      })
    ).pipe(
      map(urls => `Sent daily update to ${urls.join(', ')}`),
    );
  }
}