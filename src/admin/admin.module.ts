import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Registrant } from './entities/registrant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Registrant])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
