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

  findAll(limit: number): { items: Dish[]; total: number; limit: number; } {
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
