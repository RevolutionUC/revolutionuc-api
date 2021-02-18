import { IsNotEmpty, IsString } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Column,
  ManyToOne
} from 'typeorm';
import { Category } from './category.entity';
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

  @OneToMany(() => Judge, judge => judge.group)
  judges: Judge[]

  @ManyToOne(() => Category, category => category.groups)
  category: Category

  @ManyToMany(() => Submission)
  @JoinTable()
  submissions: Submission[]
}
