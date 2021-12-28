import { ApiProperty } from '@nestjs/swagger';

export class DailyUpdateDto {
  @ApiProperty()
  total: {
    registrants: number;
    confirmed: number;
  }

  @ApiProperty()
  last24hrs: {
    registrants: number;
    confirmed: number;
  }
}

export class AnonymizedRegistrant {
  @ApiProperty()
  age: string;

  @ApiProperty()
  major: string;

  @ApiProperty()
  school: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  ethnicity: string;

  @ApiProperty()
  educationLevel: string;

  @ApiProperty()
  hackathonExperience: string;
}