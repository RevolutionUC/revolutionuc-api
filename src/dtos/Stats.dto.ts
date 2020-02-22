import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
export class StatsDto {
  @ApiModelProperty()
  numRegistrants: number;

  @ApiModelProperty()
  numConfirmed: number;

  @ApiModelProperty()
  numCheckedIn: any;

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
