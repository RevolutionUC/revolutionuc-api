import { Controller, Post, Body, Delete } from '@nestjs/common';
import { MatchService } from './match.service';
import { CurrentUserDto, CurrentUser } from '../../auth/currentuser';
import { SwipeDto } from './swipe.dto';
import { Swipe } from '../entities/swipe.entity';
import { UseAuth } from 'src/auth/auth.decorator';

@Controller(`v2/lattice/match`)
@UseAuth([`HACKER`])
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
