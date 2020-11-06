import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { Registrant } from '../entities/registrant.entity';
import { Role, User } from '../entities/user.entity';
import { TokenDto } from 'dtos/Token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Registrant) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  private invalidError = new HttpException(`Invalid credentials`, HttpStatus.UNAUTHORIZED);
  
  private async findUser(username: string, roles: Role[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username, role: In(roles) }});
    if(!user) {
      throw this.invalidError;
    }

    return user;
  }

  async login(username: string, password: string, roles: Role[]): Promise<string> {
    const admin = await this.findUser(username, roles);
    const legit = await admin.comparePassword(password);

    if(!legit) {
      throw this.invalidError;
    }

    const token: TokenDto = { id: admin.id, role: `admin` };

    return this.jwtService.signAsync(token);
  }

  getUserDetails(uuid: string) {
    return this.userRepository.findOne(uuid);
  }
}
