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
