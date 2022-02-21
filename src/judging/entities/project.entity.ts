import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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
  submitter: string;

  @IsNotEmpty()
  @IsString({ each: true })
  @Column(`text`, { array: true, default: `{}` })
  team: string[];

  @IsString()
  @Column({ nullable: true })
  disqualified?: string;

  @OneToMany(() => Submission, (score) => score.project)
  submissions: Submission[];
}
