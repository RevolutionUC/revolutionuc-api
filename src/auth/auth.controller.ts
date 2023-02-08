import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { RoleGuard, Roles } from './role.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('v2/auth')
@Roles(['SUDO'])
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/me')
  @UseGuards(RoleGuard)
  getUserDetails(): Promise<User> {
    return this.authService.getUserDetails(``, []);
  }
}
