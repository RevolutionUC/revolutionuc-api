import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { environment } from '../environments/environment';
import { Registrant } from './entities/registrant.entity';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    url: environment.database_config.url,
    entities: [
      __dirname + '/../**/*.entity{.ts,.js}',
    ],
    synchronize: environment.database_config.synchronize,
    logging: environment.database_config.logging,
    ssl: true
  }), TypeOrmModule.forFeature([Registrant]), AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
