import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsDefined, IsBoolean, IsString } from 'class-validator';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  @IsString()
  from: string;

  @Column()
  @IsDefined()
  @IsString()
  to: string;

  @Column({ default: false })
  @IsDefined()
  @IsBoolean()
  read: boolean
}