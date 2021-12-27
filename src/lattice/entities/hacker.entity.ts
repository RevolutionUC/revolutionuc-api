import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsDefined, IsBoolean,
  IsArray, ArrayMaxSize, ArrayUnique,
  IsString, MaxLength
} from 'class-validator';

export type Tour = `profile` | `home` | `notification` | `reset`;

@Entity()
export class Hacker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  registrantId: string;

  @Column()
  @IsDefined()
  userId: string;

  @Column()
  name: string;

  @Column('text', { array: true })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  skills: string[]

  @Column()
  @IsDefined()
  @IsString()
  @MaxLength(250)
  idea: string

  @Column('text', { array: true })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  lookingFor: string[]

  @Column()
  @IsDefined()
  @IsString()
  discord: string

  @Column({ default: false })
  @IsDefined()
  @IsBoolean()
  inPerson: boolean

  @Column({ default: false })
  started: boolean

  @Column({ default: false })
  completed: boolean

  @Column({ default: false })
  visible: boolean

  @Column('text', { array: true })
  completedTours: Tour[]
}
