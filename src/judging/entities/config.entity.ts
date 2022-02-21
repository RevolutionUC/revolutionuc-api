import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsInt } from 'class-validator';

@Entity()
export class JudgingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsInt()
  @Column()
  year: number;

  @IsInt()
  @Column()
  generalGroupCount: number;

  @IsInt()
  @Column()
  generalJudgesPerGroup: number;

  @IsInt()
  @Column()
  generalGroupsPerProject: number;

  @IsString()
  @Column()
  titleColumn: string;

  @IsString()
  @Column()
  urlColumn: string;

  @IsString()
  @Column()
  categoryColumn: string;

  @IsString()
  @Column()
  tableNumberColumn: string;
}
