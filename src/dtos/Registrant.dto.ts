import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsBoolean,
} from 'class-validator';
const GENDERS = ['Male', 'Female', 'NonBinary', 'Other', 'PreferNot'];
const ETHNICITIES = ['Indian', 'Asian', 'Black', 'Islander', 'White', 'Latino', 'Prefer Not',];
const SHIRT_SIZES = ['X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large'];
const ALLERGENS = ['Vegetatian', 'Vegan', 'PeanutAllergy', 'GlutenFree',];
const EDUCATION_LEVEL = ['LessThanSecondary', 'HighSchool', 'Undergraduate2Year', 'Undergraduate3Year', 'Graduate', 'CodeSchool', 'Vocational', 'PostDoctorate', 'Other', 'PreferNotToAnswer'];
const HOWYOUHEARD = ['Search Engine', 'RevolutionUC Website', 'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'Email', 'Word Of Mouth', 'Other']

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "The Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo Democratic Republic of the", "Congo Republic of the", "Costa Rica",
  "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor (Timor-Leste)",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "The Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North",
  "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia Federated States of", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Sudan South", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]

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
  @IsIn(COUNTRIES)
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

  @IsString()
  @ApiPropertyOptional()
  linkedInURL: string;

  @ApiProperty()
  age: number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  acceptedWaiver: boolean;

  @IsBoolean()
  @ApiProperty()
  researchConsent: boolean;

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
