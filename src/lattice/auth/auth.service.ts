import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { Registrant } from '../../entities/registrant.entity';
import { Hacker } from '../entities/hacker.entity';

@Injectable()
export class LatticeAuthService {
  constructor(
    @InjectRepository(Registrant) private registrantRepository: Repository<Registrant>,
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    private authService: AuthService
  ) {}

  async getRegistrantEmail(registrantId: string): Promise<string> {
    try {
      const registrant = await this.registrantRepository.findOne(registrantId);
      if(!registrant || !registrant.emailVerfied) {
        throw new Error(`Invalid registrant`);
      }
      return registrant.email;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(registrantId: string, password: string): Promise<string> {
    const registrant = await this.registrantRepository.findOne(registrantId);
    if(!registrant) {
      throw new HttpException(`Registrant not found`, HttpStatus.NOT_FOUND);
    }

    const existingHacker = await this.hackerRepository.findOne({ registrantId });
    if(existingHacker) {
      throw new HttpException(`Hacker already exists`, HttpStatus.BAD_REQUEST);
    }

    const { token, user } = await this.authService.register(registrant.email, password, `HACKER`);

    const hacker = this.hackerRepository.create({
      registrantId,
      userId: user.id,
      name: ``,
      skills: [],
      idea: ``,
      lookingFor: [],
      completedTours: []
    });
    await this.hackerRepository.save(hacker);

    return token;
  }

  async login(email: string, password: string): Promise<string> {
    const { token } = await this.authService.login(email, password, [`HACKER`]);

    return token;
  }

  async sendResetLink(email: string): Promise<void> {
    return Promise.resolve();
  }

  async getResetInfo(resetToken: string): Promise<string> {
    return Promise.resolve(``);
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    return Promise.resolve();
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    return Promise.resolve();
  }
}
