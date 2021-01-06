import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { Role, User } from '../entities/user.entity';
import { CurrentUserDto } from './currentuser';
import { LoginDto } from '../dtos/User.dto';
import { validateOrReject } from 'class-validator';

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

  private async getLoginDetails(user: User): Promise<LoginDto> {
    const payload: CurrentUserDto = { id: user.id, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return { token, user: { id: user.id, username: user.username, role: user.role } };
  }

  async trustedLogin(username: string): Promise<LoginDto> {
    const user = await this.userRepository.findOne({ username });

    return this.getLoginDetails(user);
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

    return this.getLoginDetails(user);
  }

  async register(
    username: string,
    password: string,
    role: Role
  ): Promise<LoginDto> {
    const existingUser = await this.userRepository.findOne({ username });

    if(existingUser) {
      throw new HttpException(`User already exists`, HttpStatus.BAD_REQUEST);
    }

    const user = this.userRepository.create({ username, password, role });
    await validateOrReject(user);
    const newUser = await this.userRepository.save(user);

    return this.getLoginDetails(newUser);
  }

  async validateUser({ id, role }: CurrentUserDto): Promise<User> {
    return this.userRepository.findOne({ id, role });
  }

  getUserDetails(uuid: string): Promise<User> {
    return this.userRepository.findOne(uuid);
  }
}
