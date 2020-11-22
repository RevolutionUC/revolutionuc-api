import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Registrant } from '../entities/registrant.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminLoginController } from './login.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), AuthModule],
  controllers: [AdminController, AdminLoginController],
  providers: [AdminService],
})
export class AdminModule {}
