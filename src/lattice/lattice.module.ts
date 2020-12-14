import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { Hacker } from './entities/hacker.entity';
import { Swipe } from './entities/swipe.entity';
import { LatticeAuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { MatchModule } from './match/match.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Registrant, Hacker, Swipe ]),
    LatticeAuthModule,
    ProfileModule,
    MatchModule,
    NotificationModule
  ],
  controllers: [],
  providers: [],
})
export class LatticeModule {}
