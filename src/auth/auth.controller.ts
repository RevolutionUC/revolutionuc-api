import { Post, Body, Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('v2/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/me')
  @UseGuards(RoleGuard)
  getUserDetails(): Promise<User> {
    return this.authService.getUserDetails(``);
  }
}
