import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseAuth } from '../../auth/auth.decorator';
import { CurrentUser, CurrentUserDto } from '../../auth/currentuser';
import { Swipe } from '../entities/swipe.entity';
import { MatchService } from './match.service';
import { SwipeDto } from './swipe.dto';

@ApiTags('lattice')
@Controller(`v2/lattice/match`)
@UseAuth([`HACKER`])
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  swipe(
    @CurrentUser() user: CurrentUserDto,
    @Body() swipe: Pick<SwipeDto, 'to' | 'like'>,
  ): Promise<Swipe> {
    return this.matchService.swipe(user.id, swipe);
  }

  @Delete()
  reset(@CurrentUser() user: CurrentUserDto): Promise<void> {
    return this.matchService.reset(user.id);
  }
}
