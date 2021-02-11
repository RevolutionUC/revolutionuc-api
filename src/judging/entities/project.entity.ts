import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Submission } from './submission.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Column()
  url: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  tagline: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  description: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  submitterEmail: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  submitterName: string;

  @IsString()
  @Column({ nullable: true })
  disqualified?: string;

  @OneToMany(() => Submission, score => score.project, { cascade: true })
  submissions: Submission[]
}
