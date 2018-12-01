import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Registrant } from 'entities/registrant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrantDto } from 'dtos/Registrant.dto';


@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Registrant) private readonly registrantRepository: Repository<Registrant>,
  ) {}
  async register(registrant: RegistrantDto): Promise<Registrant> {
    return await this.registrantRepository.save(registrant);
  }
  async getUser(uuid: string): Promise<Registrant> {
    return await this.registrantRepository.findOneOrFail({id: uuid});
  }
  verify(uuid: string): HttpStatus {
    try {
      this.registrantRepository.update({ id: uuid }, { emailVerfied: true });
      return HttpStatus.OK;
    }
    catch (error) {
      throw new HttpException(error, 500);
    }
  }
  async getRegistrants(): Promise<Registrant[]> {
    return await this.registrantRepository.find();
  }
  checkInRegistrant(uuid: string): any {
    this.registrantRepository.update({id: uuid}, {checkedIn: true});
  }
}
