import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { setVapidDetails, sendNotification } from 'web-push';
import { Notification } from '../entities/notification.entity';
import { Hacker } from '../entities/hacker.entity';
import { NotificationDetailsDto } from './notification-details.dto';
import { PushSubscription } from './push-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

const publicKey = process.env.LATTICE_PUSH_PUBLIC_KEY;
const privateKey = process.env.LATTICE_PUSH_PRIVATE_KEY;

setVapidDetails(`https://revolutionuc.com`, publicKey, privateKey);

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>
  ) {}

  private async createNotification(from: Hacker, to: Hacker): Promise<Notification> {
    const pushSubscriptions = await this.subscriptionRepository.find({ hackerId: from.id });

    pushSubscriptions?.forEach(async ps => {
      try {
        Logger.log(`Sending match notification to ${from.name}`);
        await this.sendPushNotification(ps.subscription, `You were matched with ${to.name}`);
        Logger.log(`Sent match notification to ${from.name}`);
      } catch(err) {
        Logger.error(`Could not push notification to ${from.name}: ${err.message}`);
      }
    });

    const notification = this.notificationRepository.create({
      from: from.id,
      to: to.id,
      read: false
    });
    return this.notificationRepository.save(notification);
  }

  private async hydrateNotification(notification: Notification): Promise<NotificationDetailsDto> {
    const to = await this.hackerRepository.findOne(notification.to, { select: [
      `name`,
      `skills`,
      `idea`,
      `lookingFor`,
      `started`,
      `completed`,
      `visible`
    ]});
    return { notification, to };
  }

  private async sendPushNotification(sub: PushSubscription, data: string): Promise<unknown> {
    return sendNotification(sub, data);
  };

  async createNotificationForBoth(a: string, b: string): Promise<[Notification, Notification]> {
    const userA = await this.hackerRepository.findOne(a);
    const userB = await this.hackerRepository.findOne(b);

    return [
      await this.createNotification(userA, userB),
      await this.createNotification(userB, userA)
    ];
  }

  async getNotifications(userId: string): Promise<Array<NotificationDetailsDto>> {
    const from = await this.hackerRepository.findOne({ userId });
    const notifications = await this.notificationRepository.find({ from: from.id });
    return Promise.all(
      notifications.map(notification => this.hydrateNotification(notification))
    );
  }

  async readNotifications(userId: string): Promise<void> {
    const from = await this.hackerRepository.findOne({ userId });
    const notifications = await this.notificationRepository.find({ from: from.id, read: false });
    await this.notificationRepository.save(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  }

  async subscribe(userId: string, subscription: PushSubscription): Promise<Subscription> {
    const hacker = await this.hackerRepository.findOne({ userId });
    Logger.log(`Subscribing ${hacker.id} for push notifications`);
    const pushSubscription = this.subscriptionRepository.create({ hackerId: hacker.id, subscription });
    return this.subscriptionRepository.save(pushSubscription);
  }

  async unsubscribe(userId: string, id: string): Promise<void> {
    const hacker = await this.hackerRepository.findOne({ userId });
    Logger.log(`Unsubscribing ${hacker.id}:${id} from push notifications`);

    const subscription = await this.subscriptionRepository.findOne(id);
    if(subscription.hackerId !== hacker.id) {
      throw new HttpException(`Invalid subscription id`, HttpStatus.NOT_FOUND);
    }

    await this.subscriptionRepository.remove(subscription);
  }
}
