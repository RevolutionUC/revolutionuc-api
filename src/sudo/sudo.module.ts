import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from '../lattice/entities/skill.entity';
import { User } from '../entities/user.entity';
import { SudoController } from './sudo.controller';
import { SudoService } from './sudo.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill])],
  controllers: [SudoController],
  providers: [SudoService],
})
export class SudoModule {}
