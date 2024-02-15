import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AnonymizedRegistrantDto,
  DailyUpdateDto,
  LatticeStatsDto,
} from '../dtos/Stats.dto';
import { Registrant } from '../entities/registrant.entity';
import { Hacker } from '../lattice/entities/hacker.entity';
import { Notification } from '../lattice/entities/notification.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Registrant)
    private readonly registrantRepository: Repository<Registrant>,
    @InjectRepository(Hacker)
    private readonly hackerRepository: Repository<Hacker>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }

  async getAnonymizedData(): Promise<AnonymizedRegistrantDto[]> {
    const registrants = await this.registrantRepository.find({
      select: [
        'dateOfBirth',
        'major',
        'school',
        'gender',
        'ethnicity',
        'educationLevel',
        'hackathons',
        'createdAt',
      ],
    });

    const today = new Date();

    return registrants.map<AnonymizedRegistrantDto>((r) => {
      const dateOfBirth = new Date(r.dateOfBirth);

      const age = today.getFullYear() - dateOfBirth.getFullYear();

      return {
        ...r,
        hackathonExperience: r.hackathons.toString(),
        age: age.toString(),
        ethnicity: r.ethnicity.join(`, `),
      };
    });
  }

  async getDailyUpdate(): Promise<DailyUpdateDto> {
    const total = await this.registrantRepository.find();

    const last24hrs = total.filter(
      (r) => r.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    return {
      total: {
        registrants: total.length,
        confirmed: total.filter((r) => r.confirmedAttendance).length,
      },
      last24hrs: {
        registrants: last24hrs.length,
        confirmed: last24hrs.filter((r) => r.confirmedAttendance).length,
      },
    };
  }

  async getLatticeStats(): Promise<LatticeStatsDto> {
    const hackers$ = this.hackerRepository.find();
    const notifications$ = this.notificationRepository.find();

    const [hackers, notifications] = await Promise.all([
      hackers$,
      notifications$,
    ]);

    return {
      hackers: hackers.length,
      visible: hackers.filter((h) => h.visible).length,
      matches: notifications.length / 2,
    };
  }

  async getRegistrantsConfirmedCount(): Promise<number> {
    return await this.registrantRepository.countBy({
      confirmedAttendance: true,
    });
  }
}
