import { Controller, Get, Put, Body, Post, Param } from '@nestjs/common';
import { UseAuth } from '../../auth/auth.decorator';
import { CurrentUserDto, CurrentUser } from '../../auth/currentuser';
import { Tour } from '../entities/hacker.entity';
import { ProfileService } from './profile.service';
import { ProfileDTO, ProfileWithEmail, ScoredProfileDTO } from './profile.dto';

@Controller(`v2/lattice/profile`)
@UseAuth([`HACKER`])
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(`list`)
  getProfiles(@CurrentUser() user: CurrentUserDto): Promise<Array<ScoredProfileDTO>> {
    return this.profileService.getScoredProfiles(user.id);
  }

  @Get()
  getProfile(@CurrentUser() user: CurrentUserDto): Promise<ProfileWithEmail> {
    return this.profileService.getProfile(user.id);
  }

  @Post(`start`)
  startProfile(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.profileService.startProfile(user.id);
  }

  @Put()
  updateProfile(@CurrentUser() user: CurrentUserDto, @Body() newProfile: ProfileDTO): Promise<ProfileWithEmail> {
    return this.profileService.updateProfile(user.id, newProfile);
  }

  @Put(`visible`)
  setVisible(@CurrentUser() user: CurrentUserDto, @Body() body: { visible: boolean }): Promise<ProfileWithEmail> {
    return this.profileService.setVisible(user.id, body.visible);
  }

  @Post(`tour/:tour`)
  completeTour(@CurrentUser() user: CurrentUserDto, @Param(`tour`) tour: Tour): Promise<void> {
    return this.profileService.completeTour(user.id, tour);
  }
}
