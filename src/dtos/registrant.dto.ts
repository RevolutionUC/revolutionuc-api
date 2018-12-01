import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsEnum, IsIn, IsInt, IsNotEmpty, IsString, IsDateString, IsBoolean } from 'class-validator';
const GENDERS: string[] = ['Male', 'Female', 'NonBinary'];
const ETHNICITIES: string[] = ['Indian', 'Asian', 'Black', 'Islander', 'White', 'Latino', 'Prefer Not'];
const SHIRT_SIZES: string[] = ['Small', 'Medium', 'Large', 'X-Large'];
const ALLERGENS: string[] = ['Vegetatian', 'Vegan', 'PeanutAllergy', 'GlutenFree'];
const EDUCATION_LEVEL: string[] = ['HighSchool', 'Undergraduate', 'Graduate'];
export class RegistrantDto {
  @ApiModelPropertyOptional()
  id: string;

  @ApiModelPropertyOptional()
  createdAt: Date;

  @ApiModelPropertyOptional()
  updatedAt: Date;

  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiModelProperty()
  email: string;

  @ApiModelPropertyOptional()
  emailVerfied: boolean;

  @IsNotEmpty()
  @IsPhoneNumber('US')
  @ApiModelProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  school: string;

  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  major: string;

  @IsNotEmpty()
  @IsIn(GENDERS)
  @IsString()
  @ApiModelProperty({
    enum: GENDERS
  })
  gender: string;

  @IsIn(ETHNICITIES)
  @IsString()
  @ApiModelProperty({
    enum: ETHNICITIES
  })
  ethnicity: string;

  @IsString()
  @ApiModelProperty()
  howYouHeard: string;

  @IsInt()
  @ApiModelProperty()
  hackathons: number;

  @IsIn(SHIRT_SIZES)
  @ApiModelProperty({
    enum: SHIRT_SIZES
  })
  shirtSize: string;

  @IsString()
  @ApiModelProperty()
  githubUsername: string;

  @IsDateString()
  @ApiModelProperty()
  dateOfBirth: string;

  @IsIn(ALLERGENS, {
    each: true
  })
  @IsString({
    each: true
  })
  @ApiModelProperty({
    enum: ALLERGENS,
    isArray: true
  })
  allergens: string[];

  @IsString()
  @ApiModelProperty()
  otherAllergens: string;

  @IsIn(EDUCATION_LEVEL)
  @IsString()
  @ApiModelProperty({
    enum: EDUCATION_LEVEL
  })
  educationLevel: string;

  @IsBoolean()
  @ApiModelPropertyOptional()
  checkedIn: boolean;

}
