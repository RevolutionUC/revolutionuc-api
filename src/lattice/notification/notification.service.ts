import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sendNotification } from 'web-push';
import { AuthService } from '../../auth/auth.service';
import { Notification } from '../entities/notification.entity';
import { Hacker } from '../entities/hacker.entity';
import { NotificationDetailsDto } from './notification-details.dto';
import { PushSubscription } from './push-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class NotificationService {
  constructor(
    private authService: AuthService,
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  private async createNotification(
    from: Hacker,
    to: Hacker,
  ): Promise<Notification> {
    const pushSubscriptions = await this.subscriptionRepository.findBy({
      hackerId: from.id,
    });

    pushSubscriptions?.forEach(async (ps) => {
      try {
        Logger.log(`Sending match notification to ${from.name}`);
        await this.sendPushNotification(
          ps.subscription,
          `You were matched with ${to.name}`,
        );
        Logger.log(`Sent match notification to ${from.name}`);
      } catch (err) {
        Logger.error(
          `Could not push notification to ${from.name}: ${err.message}`,
        );
      }
    });

    const notification = this.notificationRepository.create({
      from: from.id,
      to: to.id,
      read: false,
    });
    return this.notificationRepository.save(notification);
  }

  private async hydrateNotification(
    notification: Notification,
  ): Promise<NotificationDetailsDto> {
    const hacker = await this.hackerRepository.findOne({
      where: { id: notification.to },
      select: [
        `userId`,
        `name`,
        `skills`,
        `idea`,
        `lookingFor`,
        `started`,
        `completed`,
        `visible`,
        `discord`,
      ],
    });

    const user = await this.authService.getUserDetails(hacker.userId, [
      `HACKER`,
    ]);

    return { notification, to: { ...hacker, email: user.username } };
  }

  private async sendPushNotification(
    sub: PushSubscription,
    data: string,
  ): Promise<unknown> {
    return sendNotification(sub, data);
  }

  async createNotificationForBoth(
    a: string,
    b: string,
  ): Promise<[Notification, Notification]> {
    const userA = await this.hackerRepository.findOneBy({ id: a });
    const userB = await this.hackerRepository.findOneBy({ id: b });

    return [
      await this.createNotification(userA, userB),
      await this.createNotification(userB, userA),
    ];
  }

  async getNotifications(
    userId: string,
  ): Promise<Array<NotificationDetailsDto>> {
    const from = await this.hackerRepository.findOneBy({ userId });
    const notifications = await this.notificationRepository.findBy({
      from: from.id,
    });
    return Promise.all(
      notifications.map((notification) =>
        this.hydrateNotification(notification),
      ),
    );
  }

  async readNotifications(userId: string): Promise<void> {
    const from = await this.hackerRepository.findOneBy({ userId });
    const notifications = await this.notificationRepository.findBy({
      from: from.id,
      read: false,
    });
    await this.notificationRepository.save(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  }

  async subscribe(
    userId: string,
    subscription: PushSubscription,
  ): Promise<Subscription> {
    const hacker = await this.hackerRepository.findOneBy({ userId });
    Logger.log(`Subscribing ${hacker.id} for push notifications`);
    const pushSubscription = this.subscriptionRepository.create({
      hackerId: hacker.id,
      subscription,
    });
    return this.subscriptionRepository.save(pushSubscription);
  }

  async unsubscribe(userId: string, id: string): Promise<void> {
    const hacker = await this.hackerRepository.findOneBy({ userId });
    Logger.log(`Unsubscribing ${hacker.id}:${id} from push notifications`);

    const subscription = await this.subscriptionRepository.findOneBy({ id });
    if (subscription.hackerId !== hacker.id) {
      throw new HttpException(`Invalid subscription id`, HttpStatus.NOT_FOUND);
    }

    await this.subscriptionRepository.remove(subscription);
  }
}
