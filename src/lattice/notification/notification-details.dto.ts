import { Notification } from '../entities/notification.entity';
import { Hacker } from '../entities/hacker.entity';

export class NotificationDetailsDto {
  notification: Notification
  to: Hacker & { email: string }
}