import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Hacker } from '../entities/hacker.entity';
import { Notification } from '../entities/notification.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hacker, Notification, Subscription]),
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
