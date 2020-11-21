import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { SudoController } from './sudo.controller';
import { SudoService } from './sudo.service';

@Module({
  imports: [ TypeOrmModule.forFeature([ User ]) ],
  controllers: [ SudoController ],
  providers: [ SudoService ],
})
export class SudoModule {}
