import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { UserModule } from 'users/user.module';
import { PodcastsModule } from 'podcasts/podcasts.module';
import { environment } from '../enviroments/enviroment';
import { PeopleModule } from 'people/people.module';
import { Registrant } from 'entities/registrant.entity';
import { MulterMiddleware } from 'multer.middleware';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: environment.database_config.host,
    port: environment.database_config.port,
    username: environment.database_config.username,
    password: environment.database_config.password,
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
