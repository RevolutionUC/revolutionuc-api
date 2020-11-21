import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class StatsDto {
  @ApiProperty()
  numRegistrants: number;

  @ApiProperty()
  numConfirmed: number;

  @ApiProperty()
  numCheckedIn: any;

  @ApiProperty()
  last24hrs: number;

  @ApiProperty()
  gender;

  @ApiProperty()
  top5schools;

  @ApiProperty()
  top5majors;

  @ApiProperty()
  ethnicities;

  @ApiPropertyOptional()
  shirtSizes;

  @ApiProperty()
  allergens;

  @ApiProperty()
  educationLevels;

}
