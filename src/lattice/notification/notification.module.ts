import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Hacker } from '../entities/hacker.entity';
import { Notification } from '../entities/notification.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Hacker, Notification, Subscription ])
  ],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
