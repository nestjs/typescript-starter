import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import OrdersService from './orders.service';
import RequestWithUser from '../authentication/request-with-user.interface';

@Controller('orders')
export default class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createNewOrder(@Body() order: CreateOrderDto) {
    return this.ordersService.createOrder(order);
  }

  @Get('details')
  getAllUsersOrdersWithDetails(@Req() request: RequestWithUser) {
    return this.ordersService.getAllUsersOrdersWithProducts(request.user.id);
  }

  @Get()
  getAllUsersOrders(@Req() request: RequestWithUser) {
    return this.ordersService.getAllUsersOrders(request.user.id);
  }
}
