import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendeeModule } from './attendee/attendee.module';
import { EmailModule } from './email/email.module';
import { Attendee } from './entities/attendee.entity';
import { Registrant } from './entities/registrant.entity';
import { environment } from './environment';
import { JudgingModule } from './judging/judging.module';
import { LatticeModule } from './lattice/lattice.module';
import { StatsModule } from './stats/stats.module';
import { SudoModule } from './sudo/sudo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: environment.database_config.url,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: environment.database_config.synchronize,
      logging: environment.database_config.logging,
      ssl: {
        rejectUnauthorized: false
      },
    }),
    TypeOrmModule.forFeature([Registrant, Attendee]),
    EmailModule,
    AdminModule,
    SudoModule,
    LatticeModule,
    AttendeeModule,
    JudgingModule,
    StatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
