import { Post, Body, Controller, Param, Get, Delete, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SudoService } from './sudo.service';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/User.dto';
import { RoleGuard, Roles } from '../auth/role.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('sudo')
@ApiBearerAuth()
@Controller('v2/sudo')
@Roles([`SUDO`])
@UseGuards(AuthGuard(`jwt`), RoleGuard)
export class SudoController {
  constructor(private readonly sudoService: SudoService) {}

  @Get('users')
  getUsers(): Promise<User[]> {
    return this.sudoService.getUsers();
  }

  @Post('users')
  createUser(@Body() user: UserDto): Promise<User> {
    return this.sudoService.createUser(user);
  }

  @Patch('users/:id/password')
  changePassword(@Param(`id`) id: string, @Body() { password }: Pick<UserDto, 'password'>): Promise<void> {
    return this.sudoService.changePassword(id, password);
  }

  @Patch('users/:id/role')
  changeRole(@Param(`id`) id: string, @Body() { role }: Pick<UserDto, 'role'>): Promise<void> {
    return this.sudoService.changePassword(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param(`id`) id: string): Promise<void> {
    return this.sudoService.deleteUser(id);
  }
}
