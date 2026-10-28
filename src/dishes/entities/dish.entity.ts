import { CreateDishDto } from '../dto/create-dish.dto';

export interface Dish extends CreateDishDto {
  id: number;
}
