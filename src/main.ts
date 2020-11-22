import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { environment } from '../environment';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerOptions = new DocumentBuilder()
    .setTitle('RevolutionUC API')
    .setVersion('1.0.0')
    .setBasePath('/api')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('/api');

  if (environment.production) {
    app.enableCors({
      origin: [
        'https://www.revuc.com',
        'https://revuc.com',
        'https://revolutionuc.com',
        /\.revolutionuc.com$/,
      ],
      allowedHeaders: ['Authorization', 'Content-Type'],
    });
  } else {
    app.enableCors({
      origin: '*',
      allowedHeaders: ['Authorization', 'Content-Type'],
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      skipMissingProperties: true,
    }),
  );

  await app.listen(environment.PORT || 3000);
}

bootstrap();
