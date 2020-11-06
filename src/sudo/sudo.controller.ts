import { Post, Body, Controller, Param, Get, Patch, UseGuards, Req, Res, Query, Put } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RegistrantDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import { ApiImplicitHeader, ApiUseTags } from '@nestjs/swagger';
import { SudoService } from './sudo.service';
import { User } from 'entities/user.entity';
import { UserDto } from 'dtos/User.dto';

@ApiUseTags('sudo')
@Controller('v2/sudo')
export class SudoController {
  constructor(private readonly sudoService: SudoService) {}

  @Get('users')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  getUsers(): Promise<User[]> {
    return this.sudoService.getUsers();
  }

  @Post('users')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  createUser(@Body() user: UserDto): Promise<User> {
    return this.sudoService.createUser(user);
  }
}
