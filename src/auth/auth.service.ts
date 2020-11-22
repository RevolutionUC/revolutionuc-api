import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { Role, User } from '../entities/user.entity';
import { CurrentUserDTO } from './currentuser';
import { LoginDto } from '../dtos/User.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private invalidError = new HttpException(
    `Invalid credentials`,
    HttpStatus.UNAUTHORIZED,
  );

  private async findUser(username: string, roles: Role[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username, role: In(roles) },
    });
    if (!user) {
      throw this.invalidError;
    }

    return user;
  }

  async login(
    username: string,
    password: string,
    roles: Role[],
  ): Promise<LoginDto> {
    const user = await this.findUser(username, roles);
    const legit = await user.comparePassword(password);

    if (!legit) {
      throw this.invalidError;
    }

    const payload: CurrentUserDTO = { id: user.id, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return { token, user: { username: user.username, role: user.role } };
  }

  async validateUser({ id, role }: CurrentUserDTO): Promise<User> {
    return this.userRepository.findOne({ id, role });
  }

  getUserDetails(uuid: string): Promise<User> {
    return this.userRepository.findOne(uuid);
  }
}
