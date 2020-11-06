import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

const secret = process.env.CRYPTO_KEY;

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
