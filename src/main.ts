import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { environment } from '../enviroments/enviroment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerOptions = new DocumentBuilder()
  .setTitle('RevolutionUC API')
  .setVersion('0.0.1')
  .setBasePath('/api')
  .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);
  app.setGlobalPrefix('/api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: environment.production,
    skipMissingProperties: true
  }));
  await app.listen(3000);
}
bootstrap();
