import { config } from 'dotenv';
config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerOptions = new DocumentBuilder()
    .setTitle('RevolutionUC API')
    .setVersion('2.0.0')
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
