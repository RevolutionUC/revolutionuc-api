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

  async createAttendee(data: AttendeeDto): Promise<Attendee> {
    const existing = await this.attendeeRepository.findOneBy({
      email: data.email,
    });
    if (existing) {
      throw new HttpException(
        `Attendee with this email already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const attendee = this.attendeeRepository.create(data);
    return this.attendeeRepository.save(attendee);
  }

  async createAttendees(file: Express.Multer.File): Promise<Array<Attendee>> {
    const csv = file.buffer.toString();
    const json: AttendeeDto[] = csvToJson(csv);

    const attendees: Attendee[] = await Promise.all(
      json.map(async (attendee) => {
        const existing = await this.attendeeRepository.findOneBy({
          email: attendee.email,
        });
        if (!existing) {
          return this.attendeeRepository.create(attendee);
        }
        return Object.assign(existing, attendee);
      }),
    );

    return this.attendeeRepository.save(attendees);
  }

  async checkInAttendee(email: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findOneBy({ email });

    if (!attendee) {
      throw new HttpException(`Invalid email`, HttpStatus.NOT_FOUND);
    }

    if (attendee.checkedIn) {
      throw new HttpException(`Already checked in`, HttpStatus.FORBIDDEN);
    }

    attendee.checkedIn = true;
    return this.attendeeRepository.save(attendee);
  }
}
