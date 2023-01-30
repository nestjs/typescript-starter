import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import CartsService from './carts.service';
import RequestWithUser from '../authentication/request-with-user.interface';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('carts')
export default class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  createNewCart(@Body() cart: CreateCartDto, @Req() request: RequestWithUser) {
    return this.cartsService.createCart(cart, request.user);
  }

  @Get()
  getActiveCart(@Req() request: RequestWithUser) {
    return this.cartsService.getActiveCart(request.user);
  }

  @Post('products')
  addProductsToCart(
    @Req() request: RequestWithUser,
    @Body() productsIdsArray: number[],
  ) {
    return this.cartsService.addProductsToCart(
      request.user,
      request.body.productsIds,
    );
  }

  @Post('orders/finish')
  finishTransaction(@Req() request: RequestWithUser) {
    return this.cartsService.finishTransaction(request.user.id);
  }

  @Post('empty')
  emptyActiveCart(@Req() request: RequestWithUser) {
    return this.cartsService.emptyActiveCart(request.user);
  }
}

//TODO:
// 21. createdUser.password = undefined, delete password from user response, delete specific data while returning
