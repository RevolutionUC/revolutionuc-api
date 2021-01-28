import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../../entities/registrant.entity';
import { Hacker } from '../entities/hacker.entity';
import { AuthModule } from '../../auth/auth.module';
import { EmailModule } from 'src/email/email.module';
import { LatticeAuthController } from './auth.controller';
import { LatticeAuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Registrant, Hacker ]),
    AuthModule,
    EmailModule
  ],
  controllers: [LatticeAuthController],
  providers: [LatticeAuthService],
})
export class LatticeAuthModule {}
