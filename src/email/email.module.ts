import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';
import { EmailService } from './email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant])],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
