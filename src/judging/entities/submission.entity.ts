import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsInt } from 'class-validator';
import { Project } from './project.entity';
import { Category } from './category.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsInt()
  @Column({ default: 0 })
  score: number;

  @ManyToOne(() => Project, (project) => project.submissions, { cascade: true })
  project: Project;

  @ManyToOne(() => Category, (cateogry) => cateogry.submissions)
  category: Category;
}
