import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsDefined, IsString, IsUrl } from 'class-validator';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  @IsString()
  title: string;

  @Column()
  @IsDefined()
  @IsString()
  @IsUrl()
  icon: string;
}