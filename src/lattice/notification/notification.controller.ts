import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseAuth } from '../../auth/auth.decorator';
import { CurrentUser, CurrentUserDto } from '../../auth/currentuser';
import { Subscription } from '../entities/subscription.entity';
import { NotificationDetailsDto } from './notification-details.dto';
import { NotificationService } from './notification.service';
import { PushSubscription } from './push-subscription.dto';

@ApiTags('lattice')
@Controller(`v2/lattice/notification`)
@UseAuth([`HACKER`])
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

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
