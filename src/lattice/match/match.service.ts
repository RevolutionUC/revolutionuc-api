import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hacker } from '../entities/hacker.entity';
import { Swipe } from '../entities/swipe.entity';
import { NotificationService } from '../notification/notification.service';
import { SwipeDto } from './swipe.dto';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    @InjectRepository(Swipe) private swipeRepository: Repository<Swipe>,
    private notificationService: NotificationService,
  ) {}

  private async checkMatch(from: string, to: string): Promise<void> {
    const otherWaySwipe = await this.swipeRepository.findOneBy({
      from: to,
      to: from,
      like: true,
    });

    if (!otherWaySwipe) {
      Logger.log(`other way swipe not found`);
      return;
    }
    Logger.log(`other way swipe positive, creating notification`);

    this.notificationService.createNotificationForBoth(from, to);
  }

  async swipe(
    userId: string,
    swipe: Pick<SwipeDto, 'to' | 'like'>,
  ): Promise<Swipe> {
    const from = await this.hackerRepository.findOneBy({ userId });
    const existing = await this.swipeRepository.findOneBy({
      from: from.id,
      to: swipe.to,
    });
    if (existing) {
      Logger.error(`${from.id} already swiped on ${swipe.to}`);
      throw new HttpException(`Already swiped`, HttpStatus.BAD_REQUEST);
    }

    Logger.log(`${from.id} swiping on ${swipe.to}`);
    const newSwipe = this.swipeRepository.create({ ...swipe, from: from.id });
    const savedSwipe = await this.swipeRepository.save(newSwipe);

    if (savedSwipe.like) {
      Logger.log(`swipe positive, checking other way`);
      this.checkMatch(savedSwipe.from, savedSwipe.to);
    }

    return savedSwipe;
  }

  async reset(userId: string): Promise<void> {
    const from = await this.hackerRepository.findOneBy({ userId });
    const swipes = await this.swipeRepository.findBy({
      from: from.id,
      like: false,
    });
    await this.swipeRepository.remove(swipes);

    return;
  }
}
