import { Controller, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchService } from './match.service';
import { CurrentUserDto, CurrentUser } from '../../auth/currentuser';
import { SwipeDto } from './swipe.dto';
import { Swipe } from '../entities/swipe.entity';

@Controller(`v2/lattice/match`)
@UseGuards(AuthGuard(`jwt`))
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  swipe(@CurrentUser() user: CurrentUserDto, @Body() swipe: Pick<SwipeDto, 'to' | 'like'>): Promise<Swipe> {
    return this.matchService.swipe(user.id, swipe);
  }

  @Delete()
  reset(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.matchService.reset(user.id);
  }
}
