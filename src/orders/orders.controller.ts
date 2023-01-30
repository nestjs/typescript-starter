import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import OrdersService from './orders.service';
import RequestWithUser from '../authentication/request-with-user.interface';
import { GetOrdersBetweenDatesDto } from './dto/get-orders-between-dates.dto';

@Controller('orders')
export default class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createNewOrder(@Body() order: CreateOrderDto) {
    return this.ordersService.createOrder(order);
  }

  @Get('details')
  getAllUsersOrdersWithDetails(@Req() request: RequestWithUser) {
    return this.ordersService.getAllUsersOrdersWithProducts(request.user);
  }

  @Get()
  getAllUsersOrders(@Req() request: RequestWithUser) {
    return this.ordersService.getAllUsersOrders(request.user.id);
  }

  @Get('date-search')
  getAllUsersOrdersBetweenDates(
    @Body() dates: GetOrdersBetweenDatesDto,
    @Req() request: RequestWithUser,
  ) {
    return this.ordersService.getAllUsersOrdersBetweenDates(
      request.user.id,
      dates.startDate,
      dates.endDate,
    );
  }
}
