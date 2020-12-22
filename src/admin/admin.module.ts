import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Registrant } from '../entities/registrant.entity';
import { AdminController } from './admin.controller';
import { AdminLoginController } from './login.controller';
import { AdminService } from './admin.service';
import { EmailService } from './email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), AuthModule],
  controllers: [AdminController, AdminLoginController],
  providers: [AdminService, EmailService],
  exports: [EmailService]
})
export class AdminModule {}
