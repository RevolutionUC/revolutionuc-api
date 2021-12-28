import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AnonymizedRegistrant, DailyUpdateDto } from "../dtos/Stats.dto";
import { Registrant } from '../entities/registrant.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Registrant)
    private readonly registrantRepository: Repository<Registrant>,
  ) { }

  async getAnonymizedData(): Promise<AnonymizedRegistrant[]> {
    const registrants = await this.registrantRepository.find({
      select: [
        'dateOfBirth',
        'major',
        'school',
        'gender',
        'ethnicity',
        'educationLevel',
        'hackathons',
      ]
    });

    const today = new Date();

    const processed = registrants.map<AnonymizedRegistrant>(r => {
      const dateOfBirth = new Date(r.dateOfBirth);

      const age = today.getFullYear() - dateOfBirth.getFullYear();

      return ({
        ...r,
        hackathonExperience: r.hackathons.toString(),
        age: age.toString(),
        ethnicity: r.ethnicity.join(`, `)
      })
    });

    return processed;
  }

  async getDailyUpdate(): Promise<DailyUpdateDto> {
    const total = await this.registrantRepository.find();

    const last24hrs = total.filter(r =>
      r.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      total: {
        registrants: total.length,
        confirmed: total.filter(r => r.confirmedAttendance).length,
      },
      last24hrs: {
        registrants: last24hrs.length,
        confirmed: last24hrs.filter(r => r.confirmedAttendance).length,
      }
    }
  }
}
