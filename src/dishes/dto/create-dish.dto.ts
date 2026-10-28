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
