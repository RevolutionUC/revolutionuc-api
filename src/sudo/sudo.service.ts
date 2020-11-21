import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Role, User } from '../entities/user.entity';
import { UserDto } from '../dtos/User.dto';

@Injectable()
export class SudoService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(data: UserDto): Promise<User> {
    const user = this.userRepository.create(data);
    await validateOrReject(user);
    return this.userRepository.save(user);
  }

  async changePassword(id: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    if(!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    user.password = password;
    await user.hashPassword();
    await this.userRepository.save(user);
  }

  async changeRole(id: string, role: Role): Promise<void> {
    const user = await this.userRepository.findOne(id);
    if(!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    user.role = role;
    await this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const { affected } = await this.userRepository.delete(id);
    if(!affected) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    return;
  }
}
