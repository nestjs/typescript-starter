import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import CartsService from './carts.service';
import RequestWithUser from '../authentication/request-with-user.interface';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('carts')
export default class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  createNewCart(@Body() cart: CreateCartDto, @Req() request: RequestWithUser) {
    return this.cartsService.createCart(cart, request.user.id);
  }

  @Get()
  getActiveCart(@Req() request: RequestWithUser) {
    return this.cartsService.getActiveCart(request.user.id);
  }

  @Post('products')
  addProductsToCart(
    @Req() request: RequestWithUser,
    @Body() productsIdsArray: number[],
  ) {
    return this.cartsService.addProductsToCart(
      request.user.id,
      request.body.productsIds,
    );
  }

  @Post('orders/finish')
  finishTransaction(@Req() request: RequestWithUser) {
    return this.cartsService.finishTransaction(request.user.id);
  }

  @Post('empty')
  emptyActiveCart(@Req() request: RequestWithUser) {
    return this.cartsService.emptyActiveCart(request.user.id);
  }
}

//TODO:
// 10. Globalny Guard by się przydał w połączeniu z dekoratorem IsPublic
// 12. Order entity --> status encji lepiej robić enumem a nie booleanem, bo co jeżeli wymaganie się zmieni i będzie płatnośc in progress?
// 13. Zrób obsługę dat za pomocą luxona + stwórz endpoint który będzie przyjmował startDate i endDate i zwracał wszystkie ordery pomiedzy tymi datami, waliduj customowym walidatorem czy startDate nie jest po endDate
// 14. Cart service ->         finishedAt: new Date(Date.now()).toString(), ==> może lepiej toISOString?
// 17. notFoundException - dodać informację jaki ID ma user
// 19. Create cart DTO is archived jest niepotrzebne
// 21. createdUser.password = undefined, delete password from user response, delete specific data while returning
// 22. nie BadRequest tylko Conflict 409 - same email
// 23. getAuthenticatedUser => loginUser, getCookie => createCookie,
// 24. logOut - jeżeli ktos sie wylogowuje , invalidate json web token nest js, zapisywanie tokenów które nie są ważne i nie przepuzsczać ich (blocklista)
// 27. nest js global guards app.useGlobalGuard(new RolesGuar()) nestjs globa lgurd isPublic add exclude feature for global guard
// 28. typ Date
