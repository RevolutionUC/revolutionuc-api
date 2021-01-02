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
  createSkill(@Body() data: SkillDto): Promise<Skill> {
    return this.matchService.createSkill(data);
  }
}
