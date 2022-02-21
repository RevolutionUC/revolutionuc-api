import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsDefined, IsBoolean, IsString } from 'class-validator';

@Entity()
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsDefined()
  @IsString()
  from: string;

  @Column()
  @IsDefined()
  @IsString()
  to: string;

  @Column()
  @IsDefined()
  @IsBoolean()
  like: boolean;
}
