import { Controller, Post, Body, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillDto } from './skill.dto';
import { Skill } from '../entities/skill.entity';

@Controller(`v2/lattice/skills`)
export class SkillsController {
  constructor(private readonly matchService: SkillsService) {}

  @Get()
  getSkills(): Promise<Array<Skill>> {
    return this.matchService.getSkills();
  }

  @Post()
  createSkills(@Body() data: Array<SkillDto>): Promise<Array<Skill>> {
    return this.matchService.createSkills(data);
  }
}
