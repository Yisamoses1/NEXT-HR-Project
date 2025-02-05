import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class ErrorHandler {
  static handle(error: any): never {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ForbiddenException(
          'Credentials taken (e.g., email already exists)',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Record not found');
      }
      throw new InternalServerErrorException('Database error occurred');
    }

    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message || 'Bad request');
    }
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message || 'Resource not found');
    }
    if (error instanceof ForbiddenException) {
      throw new ForbiddenException(error.message || 'Forbidden');
    }
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
