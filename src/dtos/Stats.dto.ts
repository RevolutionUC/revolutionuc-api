import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
interface GenderDto {
  male: number;
  female: number;
  nonbinary: number;
  other: number;
  prefernot: number;
}
interface EthnicitiesDto {
  indian: number;
  asian: number;
  black: number;
  islander: number;
  white: number;
  latino: number;
  prefernot: number;
}
interface ShirtDto {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}
interface AllergensDto {
  vegetarian: number;
  vegan: number;
  penutAllergy: number;
  glutenFree: number;
}
interface EduLevelsDto {
  highschool: number;
  undergraduate: number;
  graduate: number;
}
export class StatsDto {
  @ApiModelProperty()
  numRegistrants: number;

  @ApiModelProperty()
  last24hrs: number;

  @ApiModelProperty()
  gender;

  @ApiModelProperty()
  top5schools;

  @ApiModelProperty()
  top5majors;

  @ApiModelProperty()
  ethnicities;

  @ApiModelPropertyOptional()
  shirtSizes;

  @ApiModelProperty()
  allergens;

  @ApiModelProperty()
  educationLevels;

}
