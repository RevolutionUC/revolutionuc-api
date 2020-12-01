import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  Delete,
  Patch
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SudoService } from './sudo.service';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/User.dto';
import { UseAuth } from 'src/auth/auth.decorator';

@ApiTags('sudo')
@Controller('v2/sudo')
@UseAuth([`SUDO`])
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
  changePassword(
    @Param(`id`) id: string,
    @Body() { password }: Pick<UserDto, 'password'>,
  ): Promise<void> {
    return this.sudoService.changePassword(id, password);
  }

  @Patch('users/:id/role')
  changeRole(
    @Param(`id`) id: string,
    @Body() { role }: Pick<UserDto, 'role'>,
  ): Promise<void> {
    return this.sudoService.changePassword(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param(`id`) id: string): Promise<void> {
    return this.sudoService.deleteUser(id);
  }
}
