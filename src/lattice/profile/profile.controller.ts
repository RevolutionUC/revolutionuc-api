import { Controller, Get, Put, Body, Post, Param } from '@nestjs/common';
import { Tour, Hacker } from '../entities/hacker.entity';
import { UseAuth } from '../../auth/auth.decorator';
import { CurrentUserDto, CurrentUser } from '../../auth/currentuser';
import { ProfileService } from './profile.service';
import { ProfileDTO, ScoredProfileDTO, SkillDTO } from './profile.dto';
import skills from './skills';

@Controller(`v2/lattice/profile`)
@UseAuth([`HACKER`])
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(`list`)
  getProfiles(@CurrentUser() user: CurrentUserDto): Promise<Array<ScoredProfileDTO>> {
    return this.profileService.getScoredProfiles(user.id);
  }

  @Get()
  getProfile(@CurrentUser() user: CurrentUserDto): Promise<Hacker> {
    return this.profileService.getProfile(user.id);
  }

  @Post(`start`)
  startProfile(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.profileService.startProfile(user.id);
  }

  @Put()
  updateProfile(@CurrentUser() user: CurrentUserDto, @Body() newProfile: ProfileDTO): Promise<Hacker> {
    return this.profileService.updateProfile(user.id, newProfile);
  }

  @Put(`visible`)
  setVisible(@CurrentUser() user: CurrentUserDto, @Body() body: { visible: boolean }): Promise<Hacker> {
    return this.profileService.setVisible(user.id, body.visible);
  }

  @Get(`skills`)
  getSkills(): Array<SkillDTO> {
    return skills;
  }

  @Post(`tour/:tour`)
  completeTour(@CurrentUser() user: CurrentUserDto, @Param(`tour`) tour: Tour): Promise<void> {
    return this.profileService.completeTour(user.id, tour);
  }
}
