import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import csvToJson from 'csvjson-csv2json';
import { Attendee } from '../entities/attendee.entity';
import { AttendeeDto } from '../dtos/Attendee.dto';

@Injectable()
export class AttendeeService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  async createAttendees(file: Express.Multer.File): Promise<Array<Attendee>> {
    const csv = file.buffer.toString();
    const json: AttendeeDto[] = csvToJson(csv);

    const attendees: Attendee[] = await Promise.all(
      json.map(async attendee => {
        const existing = await this.attendeeRepository.findOne({ email: attendee.email });
        if(!existing) {
          return this.attendeeRepository.create(attendee);
        }
        return Object.assign(existing, attendee);
      })
    );

    return this.attendeeRepository.save(attendees);
  }

  async checkInAttendee(email: string): Promise<void> {
    try {
      const result = await this.attendeeRepository.update({ email }, {
        checkedIn: true,
      });
      if (!result.affected) {
        throw new HttpException(`Invalid email`, HttpStatus.NOT_FOUND);
      }
      return;
    } catch (err) {
      throw new HttpException(
        `Error checking in attendee: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
