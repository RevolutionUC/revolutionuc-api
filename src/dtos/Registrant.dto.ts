import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
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
const SHIRT_SIZES: string[] = [
  'X-Small',
  'Small',
  'Medium',
  'Large',
  'X-Large',
  'XX-Large',
];
const ALLERGENS: string[] = [
  'Vegetatian',
  'Vegan',
  'PeanutAllergy',
  'GlutenFree',
];
const EDUCATION_LEVEL: string[] = ['HighSchool', 'Undergraduate', 'Graduate'];
const HOWYOUHEARD: string[] = ['Search Engine', 'RevolutionUC Website', 'Facebook', 
'Twitter', 'Instagram', 'LinkedIn', 'Email', 'Word Of Mouth', 'Other']
export class RegistrantDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  emailVerfied: boolean;

  @IsNotEmpty()
  @IsPhoneNumber(null)
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  school: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  major: string;

  @IsNotEmpty()
  @IsIn(GENDERS)
  @IsString()
  @ApiProperty({
    enum: GENDERS,
  })
  gender: string;

  @IsIn(ETHNICITIES, { each: true })
  @IsArray()
  @ApiProperty({
    enum: ETHNICITIES,
  })
  ethnicity: string[];

  @IsIn(HOWYOUHEARD, { each: true }) 
  @IsArray()
  @ApiProperty({
    enum: HOWYOUHEARD,
  })
  howYouHeard: string[];

  @IsInt()
  @ApiProperty()
  hackathons: number;

  @IsIn(SHIRT_SIZES)
  @ApiProperty({
    enum: SHIRT_SIZES,
  })
  shirtSize: string;

  @IsString()
  @ApiPropertyOptional()
  githubUsername: string;

  @IsDateString()
  @ApiProperty()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  acceptedWaiver: boolean;

  @IsIn(ALLERGENS, {
    each: true,
  })
  @IsString({
    each: true,
  })
  @ApiProperty({
    enum: ALLERGENS,
    isArray: true,
  })
  allergens: string[];

  @IsString()
  @ApiProperty()
  otherAllergens: string;

  @IsIn(EDUCATION_LEVEL)
  @IsString()
  @ApiProperty({
    enum: EDUCATION_LEVEL,
  })
  educationLevel: string;

  @IsBoolean()
  @ApiPropertyOptional()
  checkedIn: boolean;

  @IsString()
  @ApiPropertyOptional()
  confirmedAttendance1: string;

  @ApiPropertyOptional()
  emailsReceived: string[];
  @IsBoolean()
  @ApiPropertyOptional()
  isWaitlisted: boolean;
}
export class VerifyAttendanceDto {
  uuid: string;
  isConfirmed: boolean;
}

export class SendEmailDto {
  template: string;
  recipent: string;
  dryRun?: boolean;
}
