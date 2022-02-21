import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsIn, IsBoolean, IsString, IsEmail } from 'class-validator';

export type AttendeeRole = 'SPONSOR' | 'MENTOR' | 'JUDGE' | 'HACKER';

export const ATTENDEE_ROLES: AttendeeRole[] = [
  'SPONSOR',
  'MENTOR',
  'JUDGE',
  'HACKER',
];

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsString()
  @Column()
  name: string;

  @IsString()
  @IsIn(ATTENDEE_ROLES)
  @Column({ enum: ATTENDEE_ROLES })
  role: AttendeeRole;

  @IsBoolean()
  @Column({ default: false })
  isMinor: boolean;

  @IsBoolean()
  @Column({ default: false })
  checkedIn: boolean;
}
