import { config } from 'dotenv';
config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { setVapidDetails } from 'web-push';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './environment';

async function bootstrap() {
  const publicKey = process.env.LATTICE_PUSH_PUBLIC_KEY;
  const privateKey = process.env.LATTICE_PUSH_PRIVATE_KEY;

  setVapidDetails(`https://revolutionuc.com`, publicKey, privateKey);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  const swaggerOptions = new DocumentBuilder()
    .setTitle('RevolutionUC API')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);

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
