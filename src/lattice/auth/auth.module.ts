import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../../entities/registrant.entity';
import { AuthModule } from '../../auth/auth.module';
import { Hacker } from '../entities/hacker.entity';
import { LatticeAuthController } from './auth.controller';
import { LatticeAuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Registrant, Hacker ]),
    AuthModule
  ],
  controllers: [LatticeAuthController],
  providers: [LatticeAuthService],
})
export class LatticeAuthModule {}
