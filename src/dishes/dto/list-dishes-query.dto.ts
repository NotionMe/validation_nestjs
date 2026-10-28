import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListDishesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
