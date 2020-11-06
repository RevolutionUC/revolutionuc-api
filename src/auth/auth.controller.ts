import { Post, Body, Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ApiUseTags } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { CredentialsDto } from 'dtos/User.dto';

@ApiUseTags('auth')
@Controller('v2/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/admin')
  loginToAdmin(@Body() credentials: CredentialsDto): Promise<string> {
    return this.authService.login(credentials.username, credentials.password, ['SUDO', 'ADMIN']);
  }

  @Post('login/judging')
  loginToJudging(@Body() credentials: CredentialsDto): Promise<string> {
    return this.authService.login(credentials.username, credentials.password, ['SUDO', 'ADMIN', 'JUDGE']);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  getUserDetails(): Promise<User> {
    return this.authService.getUserDetails(``);
  }
}
