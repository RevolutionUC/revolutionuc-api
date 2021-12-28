import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Skill } from '../entities/skill.entity';
import { SkillDto } from './skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('lattice')
@Controller(`v2/lattice/skills`)
export class SkillsController {
  constructor(private readonly matchService: SkillsService) { }

  @Get()
  getSkills(): Promise<Array<Skill>> {
    return this.matchService.getSkills();
  }

  @Post()
  createSkills(@Body() data: Array<SkillDto>): Promise<Array<Skill>> {
    return this.matchService.createSkills(data);
  }
}
