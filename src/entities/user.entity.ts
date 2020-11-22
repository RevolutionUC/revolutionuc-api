import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { hash, compare } from 'bcrypt';

export type Role = 'SUDO' | 'ADMIN' | 'JUDGE' | 'HACKER';

export const ROLES: Role[] = ['SUDO', 'ADMIN', 'JUDGE', 'HACKER'];

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsString()
  @Column({ unique: true })
  username: string;

  @IsNotEmpty()
  @Column()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(ROLES)
  @Column({ enum: ROLES })
  role: Role;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await hash(this.password, 10);
  }

  comparePassword(attempt: string): Promise<boolean> {
    return compare(attempt, this.password);
  }
}
