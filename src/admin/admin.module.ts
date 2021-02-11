import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Registrant } from '../entities/registrant.entity';
import { AdminController } from './admin.controller';
import { AdminLoginController } from './login.controller';
import { AdminService } from './admin.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), AuthModule, EmailModule],
  controllers: [AdminController, AdminLoginController],
  providers: [AdminService],
})
export class AdminModule {}
