import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { environment } from '../environments/environment';
import { Registrant } from './entities/registrant.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    url: environment.database_config.url,
    database: environment.database_config.database,
    entities: [
      'src/**/**.entity{.ts,.js}',
    ],
    synchronize: environment.database_config.synchronize,
    logging: environment.database_config.logging
  }), TypeOrmModule.forFeature([Registrant])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(MulterMiddleware)
  //     .forRoutes({ path: '/registrant', method: RequestMethod.POST });
  // }
}
