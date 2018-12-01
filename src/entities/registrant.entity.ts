import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsIn, IsInt, IsDateString, IsBoolean } from 'class-validator';
const GENDERS: string[] = ['Male', 'Female', 'NonBinary'];
const ETHNICITIES: string[] = ['Indian', 'Asian', 'Black', 'Islander', 'White', 'Latino', 'Prefer Not'];
const SHIRT_SIZES: string[] = ['Small', 'Medium', 'Large', 'X-Large'];
const ALLERGENS: string[] = ['Vegetatian', 'Vegan', 'PeanutAllergy', 'GlutenFree'];
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
    unique: true
  })
  email: string;

  @Column({
    default: false
  })
  emailVerfied: boolean;

  @IsNotEmpty()
  @IsPhoneNumber('US')
  @Column()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  school: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  major: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    enum: GENDERS
  })
  gender: string;

  @IsString()
  @Column({
    nullable: true,
    enum: ETHNICITIES
  })
  ethnicity: string;

  @IsString()
  @Column({
    nullable: true
  })
  howYouHeard: string;

  @IsInt()
  @Column({
    nullable: true
  })
  hackathons: number;

  @Column({
    enum: SHIRT_SIZES
  })
  shirtSize: string;

  @IsString()
  @Column({
    nullable: true
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
    nullable: true
  })
  otherAllergens: string;

  @IsString()
  @Column({
    enum: EDUCATION_LEVEL
  })
  educationLevel: string;

  @Column({default: true})
  @IsBoolean()
  checkedIn: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
export interface UploadKeyDto {
  uploadKey: string;
}

