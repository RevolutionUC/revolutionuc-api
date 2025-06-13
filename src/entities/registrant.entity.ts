import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
const EDUCATION_LEVEL: string[] = ['LessThanSecondary', 'HighSchool', 'Undergraduate2Year', 'Undergraduate3Year', 'Graduate', 'CodeSchool', 'Vocational', 'PostDoctorate', 'Other', 'PreferNotToAnswer'];

const HOWYOUHEARD: string[] = ['Search Engine', 'RevolutionUC Website', 'Facebook', 
'Twitter', 'Instagram', 'LinkedIn', 'Email', 'Word Of Mouth', 'Other']
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

  // @IsString()
  // @Column({
  //   nullable: true,
  // })
  // howYouHeard: string;
  @IsString()
  @Column('enum', {
    nullable: true, 
    enum: HOWYOUHEARD,
    array: true,
  })
  howYouHeard: string[];


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

  @IsString()
  @Column({
    nullable: true,
  })
  linkedinUrl: string;

  @Column()
  age: number;

  @Column('text', {
    nullable: true,
    array: true,
  })
  allergens: string[];

  @IsString()
  @Column({
    nullable: true,
  })
  confirmedAttendance?: boolean;

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
  researchConsent: boolean;

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
