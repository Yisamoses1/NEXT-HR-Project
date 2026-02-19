import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { GlobalExceptionFilter } from './common/errorHandler.utils'
import { LoggingInterceptor } from './utilities/logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 400,
      exceptionFactory: (errors) => {
        const messages = errors
          .map((err) => {
            return Object.values(err.constraints ?? {})
          })
          .flat()

        return new BadRequestException(messages)
      },
    }),
  )

  app.useGlobalInterceptors(new LoggingInterceptor())

  //app.useGlobalFilters(new GlobalExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Customer Service API')
    .setDescription('API documentation for the customer service application')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)
  await app.listen(process.env.PORT)
  console.log(`Application is running on port ${process.env.PORT}`)
}
bootstrap()
