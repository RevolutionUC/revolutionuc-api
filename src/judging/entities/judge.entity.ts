import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ArrayMaxSize, ArrayUnique, IsArray, IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @Column()
  category: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @Column('text', { array: true })
  rankings: Array<string>
}
