import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
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
        throw new ForbiddenException('This data already exists. Please use a different value.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('The requested record could not be found.');
      }
      throw new InternalServerErrorException('A database error occurred. Please try again later.');
    }
    if (error instanceof HttpException) {
      throw error; // Keep original exception if it's already handled
    }

    console.error('Unexpected Error:', error); // Logs unexpected errors for debugging

    throw new InternalServerErrorException('Something went wrong. Please try again later.');
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again later.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message || 'An error occurred.';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
