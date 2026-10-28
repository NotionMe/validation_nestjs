# Практична робота № 6

## Тема: Валідація вхідних даних та обробка запитів у NestJS

## Варіант № 4

---

## Мета роботи

- Опанувати послідовність обробки HTTP-запитів у NestJS.
- Реалізувати декларативну валідацію DTO та захист від невідомих полів.
- Навчитися санітизувати вхідні дані власним пайпом.
- Реалізувати логування, уніфікацію помилок та вимірювання тривалості запитів.
- Підготувати ручні та автоматизовані перевірки конвеєра.

## Технічне забезпечення

| Компонент | Версія / опис |
| --- | --- |
| ОС | Linux |
| Платформа виконання | Node.js 22+; у середовищі Node.js 26.7.0 |
| Пакетний менеджер | npm 11.19.0 у середовищі |
| Фреймворк | NestJS 12, Express 5 |
| Компілятор проєкту | TypeScript ~5.9.3 |
| Бібліотеки | class-validator, class-transformer, RxJS |
| Термінал | bash |
| Перевірка API | REST Client / curl; node:test |
| Система контролю версій | Git; віддалений репозиторій не налаштовано |

---

## Хід виконання роботи

### 1. Базовий рівень: валідація DTO

Створено NestJS-застосунок каталогу страв із модулем, контролером та сервісом. Сутність містить поля `title`, `price`, `weightGrams`, `calories`, `isSpicy` відповідно до варіанта 4.

Текст перевіряється через `IsString` та `IsNotEmpty`, ціна — `IsNumber` та `IsPositive`, маса — `IsNumber` та `Min(10)`, калорійність — `IsNumber` та `Min(0)`, ознака гостроти — `IsBoolean`. В UpdateDishDto додано `IsOptional` для кожного поля зі збереженням обмежень. Перед записом оновлень сервіс додатково відхиляє null, який пропускається декоратором IsOptional.

У main.ts зареєстровано ValidationPipe з whitelist, forbidNonWhitelisted та transform. DTO параметра limit використовує Type(() => Number), IsInt, Min(1) та Max(100). JSON-тіло з рядком замість числа відхиляється: глобальну неявну конверсію не ввімкнено.

### 2. Другий рівень: санітизація та HTTP-логування

TrimPipe рекурсивно проходить об’єкти та масиви, обрізає крайні пробіли рядків і не змінює інші типи. Він виконується перед ValidationPipe, тому назва з одних пробілів не проходить перевірку.

HttpLoggingMiddleware фіксує початковий час через performance.now(), підписується на finish і записує метод, URL, статус відповіді, тривалість та IP через Logger. У AppModule реалізовано NestModule.configure; іменований wildcard Express 5 охоплює всі маршрути.

### 3. Просунутий рівень: фільтр, інтерцептор та наскрізні сценарії

GlobalExceptionFilter перехоплює HttpException та формує поля success, statusCode, timestamp, path, method, error, message. Масив порушень class-validator зберігається у message. Невідома сутність та неправильний id також мають цей формат помилок.

TimingInterceptor обгортає виконання маршруту та через tap встановлює заголовок X-Response-Time до успішної відповіді. Через Logger виводиться час роботи. Застосування tap зберігає тіло відповіді без змін.

Файл requests.http містить чотири обов’язкові запити з PDF і додаткові граничні сценарії. У test/pipeline.e2e.cjs реалізовано автоматизовані перевірки через node:test з ізольованим сервером на вільному порту. Додатково перевіряється рекурсивне очищення вкладених даних.

### 4. Інструкція запуску

```bash
npm install
npm start
```

Перша команда встановлює залежності з package.json; друга компілює TypeScript і запускає локальний сервер на порту 3000. Дані зберігаються у пам’яті. Докладні приклади маршрутів, відповідей і відповіді на вісім контрольних питань наведено у README.md.

```bash
npm run test:e2e
```

Команда спочатку збирає застосунок, а потім перевіряє реальні HTTP-запити. Перевіряються коди статусів, очищення назви, числове значення limit, заголовок часу, правила варіанта, структура помилок та CRUD.

### 5. Фактичний стан перевірки

Встановлення залежностей у середовищі завершилося помилкою DNS EAI_AGAIN для registry.npmjs.org. Локального кешу недостатньо для офлайн-встановлення. Збірка не відбулася, оскільки відсутній встановлений компілятор tsc. Повні HTTP-тести не виконувалися, скриншоти успішного запуску не отримано, код у віддалений репозиторій не опубліковано.

Синтаксис 13 TypeScript-файлів перевірено через доступний локальний TypeScript 6.0.3 без помилок. node --check для тестового файла також завершився успішно. Перевірка синтаксису не підтверджує коректність типів та виконання. Після встановлення залежностей необхідно виконати збірку, HTTP-тести й додати фактичні скриншоти за інструкцією README.md.

---

## Висновки

- Реалізовано код базового рівня: DTO та глобальний ValidationPipe для варіанта 4.
- Реалізовано код другого рівня: рекурсивний TrimPipe та middleware HTTP-логування.
- Реалізовано код просунутого рівня: глобальний фільтр, TimingInterceptor та сценарії перевірки.
- Синтаксичні перевірки пройдено; повна збірка, виконання тестів та скриншоти потребують встановлення залежностей.

# Лістинг

## package.json

```json
{
  "name": "validation-nestjs",
  "version": "1.0.0",
  "private": true,
  "description": "Практична робота №6: валідація та Request Pipeline у NestJS",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "npm run build && node dist/main.js",
    "start:dev": "npm run build && node --watch dist/main.js",
    "build:watch": "tsc --watch",
    "test:e2e": "npm run build && node --test test/pipeline.e2e.cjs",
    "start:prod": "node dist/main.js"
  },
  "engines": { "node": ">=22" },
  "dependencies": {
    "@nestjs/common": "^12.1.2",
    "@nestjs/core": "^12.1.2",
    "@nestjs/platform-express": "^12.1.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^24.19.2",
    "typescript": "~5.9.3"
  }
}
```

Маніфест визначає залежності, вимогу Node.js та команди для збірки, запуску й тестування.

## tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "moduleResolution": "node",
    "rootDir": "src",
    "outDir": "dist",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"]
}
```

Увімкнено строгий режим TypeScript, декоратори та метадані типів, необхідні для DI та валідації NestJS.

## .gitignore

```text
node_modules/
dist/
.env
*.log
```

Згенеровані файли, пакети та локальні змінні середовища виключено з Git.

## src/app.module.ts

```typescript
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { HttpLoggingMiddleware } from './common/middleware/http-logger.middleware';
import { DishesModule } from './dishes/dishes.module';

@Module({ imports: [DishesModule] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Іменований wildcard Express 5 охоплює також кореневий шлях.
    consumer.apply(HttpLoggingMiddleware).forRoutes({
      path: '{*path}',
      method: RequestMethod.ALL,
    });
  }
}
```

Кореневий модуль імпортує каталог страв і підключає HTTP middleware до всіх маршрутів.

## src/common/filters/http-exception.filter.ts

```typescript
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
```

Фільтр зберігає статус та повідомлення виключення, доповнюючи їх контекстом запиту.

## src/common/interceptors/timing.interceptor.ts

```typescript
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
```

Інтерцептор використовує observable та tap для додавання заголовка часу без зміни даних відповіді.

## src/common/middleware/http-logger.middleware.ts

```typescript
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
```

Middleware вимірює тривалість до завершення HTTP-відповіді й логує її параметри.

## src/common/pipes/trim.pipe.ts

```typescript
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (Array.isArray(value)) {
      return value.map((item: unknown) => this.transform(item));
    }
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.transform(item)]),
      );
    }
    return value;
  }
}
```

PipeTransform реалізує рекурсивну санітизацію рядків без зміни вихідного об’єкта.

## src/dishes/dishes.controller.ts

```typescript
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param,
  ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { ListDishesQueryDto } from './dto/list-dishes-query.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { DishesService } from './dishes.service';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  create(@Body() dto: CreateDishDto) {
    return this.dishesService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListDishesQueryDto) {
    return this.dishesService.findAll(query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDishDto) {
    return this.dishesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.dishesService.remove(id);
  }
}
```

Контролер описує HTTP-маршрути та передає валідовані DTO до сервісу; ParseIntPipe перевіряє ідентифікатор.

## src/dishes/dishes.module.ts

```typescript
import { Module } from '@nestjs/common';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';

@Module({ controllers: [DishesController], providers: [DishesService] })
export class DishesModule {}
```

Модуль об’єднує контролер і сервіс, які NestJS створює через механізм залежностей.

## src/dishes/dishes.service.ts

```typescript
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';

@Injectable()
export class DishesService {
  private readonly dishes = new Map<number, Dish>();
  private nextId = 1;

  create(dto: CreateDishDto): Dish {
    const dish: Dish = { ...dto, id: this.nextId++ };
    this.dishes.set(dish.id, dish);
    return dish;
  }

  findAll(limit: number): { items: Dish[]; total: number; limit: number } {
    return {
      items: Array.from(this.dishes.values()).slice(0, limit),
      total: this.dishes.size,
      limit,
    };
  }

  findOne(id: number): Dish {
    const dish = this.dishes.get(id);
    if (!dish) {
      throw new NotFoundException(`Страву з id ${id} не знайдено`);
    }
    return dish;
  }

  update(id: number, dto: UpdateDishDto): Dish {
    const dish = this.findOne(id);
    // IsOptional пропускає null. Не дозволяємо записати null у поля сутності.
    const entries = Object.entries(dto);
    if (entries.some(([, value]) => value === null)) {
      throw new BadRequestException('Поля страви не можуть мати значення null');
    }
    Object.assign(dish, dto);
    return dish;
  }

  remove(id: number): void {
    this.findOne(id);
    this.dishes.delete(id);
  }
}
```

Сервіс зберігає страви у Map, виконує CRUD та генерує HTTP-помилки для некоректних операцій.

## src/dishes/dto/create-dish.dto.ts

```typescript
import {
  IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, Min,
} from 'class-validator';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(10)
  weightGrams!: number;

  @IsNumber()
  @Min(0)
  calories!: number;

  @IsBoolean()
  isSpicy!: boolean;
}
```

Декоратори визначають обов’язкові поля та числові й логічні обмеження варіанта 4.

## src/dishes/dto/list-dishes-query.dto.ts

```typescript
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListDishesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
```

Type перетворює limit на число; валідатори перевіряють ціле значення від 1 до 100.

## src/dishes/dto/update-dish.dto.ts

```typescript
import {
  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min,
} from 'class-validator';

export class UpdateDishDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  weightGrams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsBoolean()
  isSpicy?: boolean;
}
```

DTO дозволяє часткове оновлення зі збереженням правил перевірки переданих значень.

## src/dishes/entities/dish.entity.ts

```typescript
import { CreateDishDto } from '../dto/create-dish.dto';

export interface Dish extends CreateDishDto {
  id: number;
}
```

Інтерфейс сутності розширює контракт створення ідентифікатором id.

## src/main.ts

```typescript
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
```

Точка входу створює застосунок і реєструє глобальні пайпи, фільтр та інтерцептор. Експорт createApp дозволяє тестам запускати той самий конвеєр.

## requests.http

```http
@baseUrl = http://127.0.0.1:3000
@dishId = 1

### Тест 1: 201, очищена назва, заголовок X-Response-Time
POST {{baseUrl}}/dishes
Content-Type: application/json

{
  "title": "   Борщ український   ",
  "price": 125.5,
  "weightGrams": 350,
  "calories": 180,
  "isSpicy": false
}

### Тест 2: 400, property hackerField should not exist
POST {{baseUrl}}/dishes
Content-Type: application/json

{
  "title": "Борщ український",
  "price": 125.5,
  "weightGrams": 350,
  "calories": 180,
  "isSpicy": false,
  "hackerField": "malicious"
}

### Тест 3: 400, рядок замість числа, уніфікована помилка
POST {{baseUrl}}/dishes
Content-Type: application/json

{
  "title": "Борщ український",
  "price": "125.5",
  "weightGrams": 350,
  "calories": 180,
  "isSpicy": false
}

### Тест 4: 200, limit у JSON є числом 5
GET {{baseUrl}}/dishes?limit=5

### Обмеження варіанта 4: 400 для кожного некоректного поля
POST {{baseUrl}}/dishes
Content-Type: application/json

{
  "title": "   ",
  "price": -1,
  "weightGrams": 9,
  "calories": -1,
  "isSpicy": "false"
}

### Граничні допустимі значення: 201
POST {{baseUrl}}/dishes
Content-Type: application/json

{
  "title": "Соус чилі",
  "price": 0.01,
  "weightGrams": 10,
  "calories": 0,
  "isSpicy": true
}

### Часткове оновлення: 200, інші поля зберігаються
PATCH {{baseUrl}}/dishes/{{dishId}}
Content-Type: application/json

{
  "title": "   Борщ із квасолею   ",
  "price": 140
}

### Некоректне оновлення: 400
PATCH {{baseUrl}}/dishes/{{dishId}}
Content-Type: application/json

{
  "weightGrams": 5
}

### Заборонене null в оновленні: 400
PATCH {{baseUrl}}/dishes/{{dishId}}
Content-Type: application/json

{
  "title": null
}

### Некоректний query: 400
GET {{baseUrl}}/dishes?limit=abc

### Зайвий параметр query: 400
GET {{baseUrl}}/dishes?limit=5&hackerField=malicious

### Отримання однієї страви: 200
GET {{baseUrl}}/dishes/{{dishId}}

### Некоректний id: 400
GET {{baseUrl}}/dishes/abc

### Відсутня страва: 404 з уніфікованою структурою
GET {{baseUrl}}/dishes/999999

### Видалення: 204
DELETE {{baseUrl}}/dishes/{{dishId}}

### Видалена страва: 404
GET {{baseUrl}}/dishes/{{dishId}}
```

Набір запитів дозволяє вручну перевірити обов’язкові сценарії та додаткові помилки.

## test/pipeline.e2e.cjs

```javascript
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApp } = require('../dist/main');
const { TrimPipe } = require('../dist/common/pipes/trim.pipe');

test('TrimPipe рекурсивно очищає об’єкти та масиви', () => {
  const input = { name: '  Борщ  ', nested: { values: [' x ', 0, false, null] } };
  const result = new TrimPipe().transform(input);
  assert.deepEqual(result, { name: 'Борщ', nested: { values: ['x', 0, false, null] } });
  assert.equal(input.name, '  Борщ  ');
});

test('Request Pipeline: варіант 4', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const baseUrl = await app.getUrl();
  const valid = {
    title: '   Борщ український   ', price: 125.5,
    weightGrams: 350, calories: 180, isSpicy: false,
  };
  let id;

  async function request(method, path, body) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: response.status,
      headers: response.headers,
      body: response.status === 204 ? null : await response.json(),
    };
  }

  function checkError(result, statusCode, path, method) {
    assert.equal(result.status, statusCode);
    assert.equal(result.body.success, false);
    assert.equal(result.body.statusCode, statusCode);
    assert.equal(result.body.path, path);
    assert.equal(result.body.method, method);
    assert.equal(typeof result.body.error, 'string');
    assert.ok(Number.isFinite(Date.parse(result.body.timestamp)));
    assert.ok(result.body.message);
  }

  await t.test('1: POST → 201, trim і X-Response-Time', async () => {
    const result = await request('POST', '/dishes', valid);
    assert.equal(result.status, 201);
    assert.equal(result.body.title, 'Борщ український');
    assert.equal(result.body.isSpicy, false);
    assert.match(result.headers.get('x-response-time'), /^\d+(\.\d+)?ms$/);
    id = result.body.id;
    assert.ok(Number.isInteger(id));
  });

  await t.test('2: невідоме поле → 400, масив порушень', async () => {
    const result = await request('POST', '/dishes', { ...valid, hackerField: 'malicious' });
    checkError(result, 400, '/dishes', 'POST');
    assert.ok(Array.isArray(result.body.message));
    assert.ok(result.body.message.includes('property hackerField should not exist'));
  });

  await t.test('3: рядок замість числа → 400 у GlobalExceptionFilter', async () => {
    const result = await request('POST', '/dishes', { ...valid, price: '125.5' });
    checkError(result, 400, '/dishes', 'POST');
    assert.ok(result.body.message.some((message) => message.includes('price')));
  });

  await t.test('4: query limit=5 → число 5', async () => {
    const result = await request('GET', '/dishes?limit=5');
    assert.equal(result.status, 200);
    assert.equal(result.body.limit, 5);
    assert.equal(result.body.total, 1);
    assert.ok(result.body.items.length <= 5);
  });

  await t.test('5: усі обмеження варіанта 4', async () => {
    for (const [field, value] of [
      ['title', '   '], ['title', 123], ['price', -1], ['price', 0],
      ['weightGrams', 9], ['calories', -1], ['isSpicy', 'false'],
    ]) {
      const result = await request('POST', '/dishes', { ...valid, [field]: value });
      checkError(result, 400, '/dishes', 'POST');
      assert.ok(result.body.message.some((message) => message.includes(field)));
    }
    const missing = await request('POST', '/dishes', {});
    checkError(missing, 400, '/dishes', 'POST');
  });

  await t.test('6: граничні значення → 201', async () => {
    const result = await request('POST', '/dishes', {
      ...valid, price: 0.01, weightGrams: 10, calories: 0, isSpicy: true,
    });
    assert.equal(result.status, 201);
  });

  await t.test('7: PATCH перевіряє лише передані поля', async () => {
    const result = await request('PATCH', `/dishes/${id}`, { title: '  Суп  ' });
    assert.equal(result.status, 200);
    assert.equal(result.body.title, 'Суп');
    assert.equal(result.body.price, valid.price);
    for (const body of [{ price: -1 }, { title: null }, { hackerField: true }]) {
      checkError(await request('PATCH', `/dishes/${id}`, body), 400, `/dishes/${id}`, 'PATCH');
    }
  });

  await t.test('8: query перевіряється, типове limit=10', async () => {
    assert.equal((await request('GET', '/dishes')).body.limit, 10);
    for (const query of ['limit=abc', 'limit=0', 'limit=101', 'limit=1.5', 'extra=1']) {
      const path = `/dishes?${query}`;
      checkError(await request('GET', path), 400, path, 'GET');
    }
  });

  await t.test('9: помилки 400 та 404 мають спільний формат', async () => {
    checkError(await request('GET', '/dishes/abc'), 400, '/dishes/abc', 'GET');
    checkError(await request('GET', '/dishes/999999'), 404, '/dishes/999999', 'GET');
    checkError(await request('GET', '/missing'), 404, '/missing', 'GET');
  });

  await t.test('10: DELETE → 204, повторний GET → 404', async () => {
    const result = await request('DELETE', `/dishes/${id}`);
    assert.equal(result.status, 204);
    assert.match(result.headers.get('x-response-time'), /^\d+(\.\d+)?ms$/);
    checkError(await request('GET', `/dishes/${id}`), 404, `/dishes/${id}`, 'GET');
  });
});
```

Автоматизовані перевірки запускають справжній HTTP-сервер і звіряють статуси, заголовки та JSON-відповіді.

