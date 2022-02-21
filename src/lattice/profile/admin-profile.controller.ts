import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseAuth } from '../../auth/auth.decorator';
import { ProfileDTO } from './profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('lattice')
@Controller(`v2/lattice/admin/profile`)
@UseAuth([`ADMIN`, `SUDO`])
export class AdminProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfileByEmail(@Query(`email`) email: string): Promise<ProfileDTO> {
    return this.profileService.getProfileByEmail(email);
  }
}
