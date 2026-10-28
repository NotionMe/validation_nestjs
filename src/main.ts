import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { TrimPipe } from './common/pipes/trim.pipe';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TimingInterceptor());
  app.enableShutdownHooks();
  return app;
}

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '127.0.0.1');
  new Logger('Bootstrap').log(`API: http://127.0.0.1:${port}/dishes`);
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    new Logger('Bootstrap').error(error);
    process.exitCode = 1;
  });
}
