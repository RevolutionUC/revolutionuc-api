import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registrant } from '../entities/registrant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant])],
  controllers: [],
  providers: [],
})
export class StatsModule { }