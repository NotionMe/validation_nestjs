import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = request;
    const start = performance.now();
    response.on('finish', () => {
      const duration = (performance.now() - start).toFixed(2);
      this.logger.log(
        `${method} ${originalUrl} ${response.statusCode} +${duration}ms [${ip}]`,
      );
    });
    next();
  }
}
