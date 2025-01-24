import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Reject requests with extra fields
      transform: true, // Transform types (e.g., string to number)
    }),
    
  );
  
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Customer Service API')
    .setDescription('API documentation for the customer service application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Swagger endpoint
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT);
}
bootstrap();
