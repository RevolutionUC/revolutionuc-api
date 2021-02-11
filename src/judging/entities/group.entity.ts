import { IsNotEmpty, IsString } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Column
} from 'typeorm';
import { Judge } from './judge.entity';
import { Submission } from './submission.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  name: string;

  @OneToMany(() => Judge, judge => judge.category)
  judges: Judge[]

  @ManyToMany(() => Submission)
  @JoinTable()
  submissions: Submission[]
}
