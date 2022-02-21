import {
  Post,
  Controller,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AttendeeService } from './attendee.service';
import { UseAuth } from '../auth/auth.decorator';
import { Attendee } from '../entities/attendee.entity';
import { AttendeeDto } from 'src/dtos/Attendee.dto';

@ApiTags('attendee')
@Controller('v2/attendee')
@UseAuth([`SUDO`, `ADMIN`])
export class AttendeeController {
  constructor(private readonly adminService: AttendeeService) {}

  @Post(`checkin`)
  checkInAttendee(@Body() data: { email: string }): Promise<Attendee> {
    return this.adminService.checkInAttendee(data.email);
  }

  @Post()
  createAttendee(@Body() data: AttendeeDto): Promise<Attendee> {
    return this.adminService.createAttendee(data);
  }

  @Post(`bulk`)
  @UseInterceptors(FileInterceptor('file'))
  createAttendees(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Array<Attendee>> {
    return this.adminService.createAttendees(file);
  }
}
