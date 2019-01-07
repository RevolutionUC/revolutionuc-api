import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { environment } from '../environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerOptions = new DocumentBuilder()
  .setTitle('RevolutionUC API')
  .setVersion('1.0.0')
  .setBasePath('/api')
  .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);
  app.setGlobalPrefix('/api');
  if (environment.production) {
    app.enableCors(
      {
        origin: 'https://revolutionuc.com',
        allowedHeaders: ['X-API-KEY', 'Content-Type']
      }
    );
  }
  else {
    app.enableCors({
      allowedHeaders: ['X-API-KEY', 'Content-Type']
    });
  }
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: environment.production,
    skipMissingProperties: true
  }));
  await app.listen(process.env.PORT || 3000);
}
require('dotenv').config();
bootstrap();
