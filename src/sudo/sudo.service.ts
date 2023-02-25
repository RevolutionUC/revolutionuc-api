import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Role, User } from '../entities/user.entity';
import { UserDto } from '../dtos/User.dto';
import { Skill } from '../lattice/entities/skill.entity';

@Injectable()
export class SudoService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // async seed() {
  //   const skillsToSeed = [
  //     '.NET',
  //     'Adobe XD',
  //     'Artificial Inteligence',
  //     'Android Studio',
  //     'Angular',
  //     'Augmented Reality',
  //     'Arduino',
  //     'AWS',
  //     'Azure',
  //     'C',
  //     'C#',
  //     'C++',
  //     'CAD',
  //     'Chatbot',
  //     'COBOL',
  //     'CSS',
  //     'Cybersecurity',
  //     'Docker',
  //     'Expressjs',
  //     'Figma',
  //     'Fortran',
  //     'GCP',
  //     'Git',
  //     'Haskell',
  //     'HTML',
  //     'InVision',
  //     'Internet of Things',
  //     'Java',
  //     'Javascript',
  //     'Kotlin',
  //     'Kubernetes',
  //     'LabVIEW',
  //     'Linux',
  //     'MATLAB',
  //     'Machine Learning',
  //     'MongoDB',
  //     'MySQL',
  //     'Neural Networks',
  //     'Nginx',
  //     'Natural Language Processing',
  //     'Node',
  //     'Perl',
  //     'Photoshop',
  //     'PHP',
  //     'Prolog',
  //     'Python',
  //     'Raspberry Pi',
  //     'React',
  //     'Redis',
  //     'Robotics',
  //     'SQL',
  //     'Swift',
  //     'TypeScript',
  //     'Unity',
  //     'Unix Shell',
  //     'Unreal',
  //     'Vim',
  //     'Virtual Reality',
  //     'Vuforia',
  //     'Xcode',
  //   ];
  //   const newSkills = await this.skillRepository.create(
  //     skillsToSeed.map((skillName) => ({ title: skillName })),
  //   );
  //   return newSkills;
  // }

  getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(data: UserDto): Promise<User> {
    const user = this.userRepository.create(data);
    await validateOrReject(user);
    return this.userRepository.save(user);
  }

  async changePassword(id: string, password: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    user.password = password;
    await user.hashPassword();
    await this.userRepository.save(user);
  }

  async changeRole(id: string, role: Role): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    user.role = role;
    await this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const { affected } = await this.userRepository.delete(id);
    if (!affected) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    return;
  }
}
