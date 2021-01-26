import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Judge } from './judge.entity';
import { Submission } from './submission.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  name: string;

  @OneToMany(() => Judge, judge => judge.category)
  judges: Judge[]

  @OneToMany(() => Submission, score => score.category)
  submissions: Submission[]
}
