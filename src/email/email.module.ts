import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant]), AuthModule],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
