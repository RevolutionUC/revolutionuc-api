import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from 'entities/user.entity';
import { validateOrReject } from 'class-validator';
import { UserDto } from 'dtos/User.dto';

@Injectable()
export class SudoService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  getUsers(): Promise<User[]> {
    console.log(`blah`);
    return this.userRepository.find();
  }

  async createUser(data: UserDto): Promise<User> {
    const user = this.userRepository.create(data);
    validateOrReject(user);
    return this.userRepository.save(user);
  }
}
