import { Post, Body, Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserDto } from '../../auth/currentuser';
import { RoleGuard, Roles } from '../../auth/role.guard';
import { AuthService } from '../../auth/auth.service';
import { Role, User } from '../../entities/user.entity';
import { LoginDto, UserDto } from '../../dtos/User.dto';

const judgingRoles: Role[] = [`ADMIN`, `SUDO`, `JUDGE`];

@ApiTags('judging')
@Controller('v2/judging/auth')
@Roles(judgingRoles)
export class JudgingAuthController {
  constructor(private readonly authService: AuthService) { }

  @Post(`login`)
  login(
    @Body() credentials: Pick<UserDto, 'username' | 'password'>,
  ): Promise<LoginDto> {
    return this.authService.login(
      credentials.username,
      credentials.password,
      judgingRoles,
    );
  }

  @Get(`me`)
  @UseGuards(AuthGuard(`jwt`), RoleGuard)
  async getUserDetails(
    @CurrentUser() { id }: CurrentUserDto,
  ): Promise<Pick<User, 'id' | 'username' | 'role'>> {
    console.log({ id });
    const user = await this.authService.getUserDetails(id, judgingRoles);
    return { id: user.id, username: user.username, role: user.role };
  }
}
