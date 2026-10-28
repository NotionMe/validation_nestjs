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
