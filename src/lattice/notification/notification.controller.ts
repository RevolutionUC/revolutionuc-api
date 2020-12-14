import { Controller, Get, UseGuards, Post, Body, Delete, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserDto, CurrentUser } from '../../auth/currentuser';
import { NotificationService } from './notification.service';
import { NotificationDetailsDto } from './notification-details.dto';
import { PushSubscription } from './push-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

@Controller(`v2/lattice/notification`)
@UseGuards(AuthGuard(`jwt`))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@CurrentUser() user: CurrentUserDto): Promise<Array<NotificationDetailsDto>> {
    return this.notificationService.getNotifications(user.id);
  }

  @Post(`read`)
  readNotifications(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.notificationService.readNotifications(user.id);
  }

  @Post(`subscribe`)
  subscribe(@CurrentUser() user: CurrentUserDto, @Body() sub: PushSubscription): Promise<Subscription> {
    return this.notificationService.subscribe(user.id, sub);
  }

  @Delete(`subscribe/:id`)
  unsubscribe(@CurrentUser() user: CurrentUserDto, @Param(`id`) id: string): Promise<void> {
    return this.notificationService.unsubscribe(user.id, id);
  }
}
