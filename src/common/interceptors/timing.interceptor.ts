import {
  CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TIMING');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - start).toFixed(2);
        response.setHeader('X-Response-Time', `${duration}ms`);
        this.logger.log(`Маршрут ${request.method} ${request.originalUrl} виконано за ${duration}ms`);
      }),
    );
  }
}
