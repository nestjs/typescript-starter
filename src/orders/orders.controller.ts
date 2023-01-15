import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/jwt-authentication.guard';
import { CreateOrderDto } from './dto/createOrder.dto';
import OrdersService from './orders.service';
import RequestWithUser from '../authentication/requestWithUser.interface';

@Controller('orders')
export default class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  createNewOrder(@Body() order: CreateOrderDto) {
    return this.ordersService.createOrder(order);
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  getAllUsersOrders(@Req() request: RequestWithUser) {
    return this.ordersService.getAllUsersOrders(request.user.id);
  }
}
