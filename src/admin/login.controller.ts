import { Post, Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { UserDto, LoginDto } from '../dtos/User.dto';

@ApiTags('admin')
@Controller('v2/admin')
export class AdminLoginController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credentials: Pick<UserDto, 'username' | 'password'>): Promise<LoginDto> {
    return this.authService.login(credentials.username, credentials.password, [`ADMIN`, `SUDO`]);
  }
}
