import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { AuthService } from '../../auth/auth.service';
import { Registrant } from '../../entities/registrant.entity';
import { Hacker } from '../entities/hacker.entity';
import { ResetTokenDTO } from './dtos';

@Injectable()
export class LatticeAuthService {
  constructor(
    @InjectRepository(Registrant)
    private registrantRepository: Repository<Registrant>,
    @InjectRepository(Hacker) private hackerRepository: Repository<Hacker>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async getRegistrantEmail(registrantId: string): Promise<string> {
    try {
      const registrant = await this.registrantRepository.findOneBy({
        id: registrantId,
      });
      if (!registrant || !registrant.emailVerfied) {
        throw new Error(`Invalid registrant`);
      }
      return registrant.email;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(registrantId: string, password: string): Promise<string> {
    const registrant = await this.registrantRepository.findOneBy({
      id: registrantId,
    });
    if (!registrant) {
      throw new HttpException(`Registrant not found`, HttpStatus.NOT_FOUND);
    }

    const existingHacker = await this.hackerRepository.findOneBy({
      registrantId,
    });
    if (existingHacker) {
      throw new HttpException(`Hacker already exists`, HttpStatus.BAD_REQUEST);
    }

    const { token, user } = await this.authService.register(
      registrant.email,
      password,
      `HACKER`,
    );

    const hacker = this.hackerRepository.create({
      registrantId,
      userId: user.id,
      name: ``,
      skills: [],
      idea: ``,
      lookingFor: [],
      completedTours: [],
      discord: ``,
    });
    await this.hackerRepository.save(hacker);

    return token;
  }

  async login(email: string, password: string): Promise<string> {
    const { token } = await this.authService.login(email, password, [`HACKER`]);

    return token;
  }

  async sendResetLink(email: string): Promise<void> {
    const user = await this.authService.findUser(email, [`HACKER`]);

    const payload: ResetTokenDTO = {
      id: user.id,
      currentPassword: user.password,
      createdAt: new Date(),
    };
    const resetToken = await this.jwtService.signAsync(payload);

    await this.emailService.sendEmail({
      template: `latticeResetPassword`,
      recipent: user.username,
      resetToken,
    });
  }

  async getResetInfo(resetToken: string): Promise<string> {
    try {
      const payload: ResetTokenDTO = await this.jwtService.verifyAsync(
        resetToken,
      );
      const user = await this.authService.getUserDetails(payload.id, [
        `HACKER`,
      ]);
      if (!user || user.password !== payload.currentPassword) {
        throw new HttpException(
          `This link is either invalid or expired`,
          HttpStatus.UNAUTHORIZED,
        );
      }
      return user.username;
    } catch (err) {
      throw new HttpException(
        `Please check the link or try again later`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const payload: ResetTokenDTO = await this.jwtService.verifyAsync(
      resetToken,
    );
    await this.authService.changePassword(payload.id, password);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.authService.getUserDetails(userId, [`HACKER`]);
    const legit = await user.comparePassword(oldPassword);

    if (!legit) {
      throw new HttpException(
        `Old password is invalid`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.authService.changePassword(userId, newPassword);
  }
}
