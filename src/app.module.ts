import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { environment } from './environment';
import { Registrant } from './entities/registrant.entity';
import { AdminModule } from './admin/admin.module';
import { SudoModule } from './sudo/sudo.module';
import { LatticeModule } from './lattice/lattice.module';
import { EmailModule } from './email/email.module';
import { AttendeeModule } from './attendee/attendee.module';
import { JudgingModule } from './judging/judging.module';
import { Attendee } from './entities/attendee.entity';

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
    JudgingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
