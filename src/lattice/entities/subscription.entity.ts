import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsDefined, IsString } from 'class-validator';
import { PushSubscription } from '../notification/push-subscription.dto';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  @IsString()
  hackerId: string;

  @Column({ type: `json` })
  @IsDefined()
  @IsString()
  subscription: PushSubscription;
}