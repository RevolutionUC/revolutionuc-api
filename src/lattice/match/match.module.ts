import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { Swipe } from '../entities/swipe.entity';
import { NotificationService } from '../notification/notification.service';
import { Hacker } from '../entities/hacker.entity';
import { Notification } from '../entities/notification.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Swipe, Hacker, Notification, Subscription ]),
  ],
  controllers: [MatchController],
  providers: [MatchService, NotificationService],
})
export class MatchModule {}
