import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  @Column()
  category: string;
}
