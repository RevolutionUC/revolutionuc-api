import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';

const GENDERS: string[] = ['Male', 'Female', 'NonBinary', 'Other', 'PreferNot'];
const ETHNICITIES: string[] = [
  'Indian',
  'Asian',
  'Black',
  'Islander',
  'White',
  'Latino',
  'Prefer Not',
];
const SHIRT_SIZES: string[] = ['Small', 'Medium', 'Large', 'X-Large'];
/* const ALLERGENS: string[] = [
  'Vegetatian',
  'Vegan',
  'PeanutAllergy',
  'GlutenFree',
]; */
const EDUCATION_LEVEL: string[] = ['HighSchool', 'Undergraduate', 'Graduate'];
@Entity()
export class Registrant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @Column({
    default: false,
  })
  emailVerfied: boolean;

  @IsNotEmpty()
  @IsPhoneNumber(null)
  @Column()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  school: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  country: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  major: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    enum: GENDERS,
  })
  gender: string;

  @IsString()
  @Column('enum', {
    nullable: true,
    enum: ETHNICITIES,
    array: true,
  })
  ethnicity: string[];

  @IsString()
  @Column({
    nullable: true,
  })
  howYouHeard: string;

  @IsInt()
  @Column({
    nullable: true,
  })
  hackathons: number;

  @Column({
    enum: SHIRT_SIZES,
    nullable: true,
  })
  shirtSize: string;

  @IsString()
  @Column({
    nullable: true,
  })
  githubUsername: string;

  @IsDateString()
  @Column()
  dateOfBirth: string;

  @Column('text', {
    nullable: true,
    array: true,
  })
  allergens: string[];

  @IsString()
  @Column({
    nullable: true,
  })
  confirmedAttendance1: string;

  @IsString()
  @Column({
    nullable: true,
  })
  otherAllergens: string;

  @IsString()
  @Column({
    enum: EDUCATION_LEVEL,
  })
  educationLevel: string;

  @IsBoolean()
  @Column({ default: false })
  checkedIn: boolean;

  @IsBoolean()
  @Column({ default: false })
  acceptedWaiver: boolean;

  @IsBoolean()
  @Column({ default: false })
  isWaitlisted: boolean;

  @Column('text', {
    array: true,
    default: '{}',
    nullable: false,
  })
  emailsReceived: string[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
export interface UploadKeyDto {
  uploadKey: string;
}

export type SortKey = 'firstName' | 'lastName' | 'email' | 'createdAt';

export type SortOrder = 'ASC' | 'DESC';
