import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = exception.getStatus();
    const details = exception.getResponse();
    const payload = typeof details === 'object'
      ? details as { error?: string; message?: string | string[] }
      : { message: details };

    response.status(statusCode).json({
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      error: payload.error ?? STATUS_CODES[statusCode] ?? 'Error',
      message: payload.message ?? exception.message,
    });
  }
}
