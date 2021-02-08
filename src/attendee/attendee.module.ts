import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from 'src/entities/attendee.entity';
import { AuthModule } from '../auth/auth.module';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendee]), AuthModule],
  controllers: [AttendeeController],
  providers: [AttendeeService],
})
export class AttendeeModule {}
