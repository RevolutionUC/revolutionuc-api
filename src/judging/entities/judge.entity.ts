import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Category } from './category.entity';
import { Group } from './group.entity';

@Entity()
export class Judge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Column()
  email: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @Column('text', { array: true, nullable: true })
  rankings: Array<string>;

  @IsBoolean()
  @Column({ default: false })
  isFinal: boolean;

  @ManyToOne(() => Category, (category) => category.judges)
  category: Category;

  @ManyToOne(() => Group, (group) => group.judges)
  group: Group;
}
