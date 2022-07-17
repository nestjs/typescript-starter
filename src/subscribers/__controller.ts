import { Controller, Get, Post, Delete } from '@nestjs/common';
import SubscriberService from './__service';

@Controller('subscribers') // you can name your controller anything and this will be used as an endpoint prefix.
export default class SubscriberController {
  constructor(private readonly sbrService: SubscriberService) {}

  @Get('/:id') // to call a subscriber with id from database
  getSubscriber() {}

  @Get() // call all subscribers
  getSubscribers() {}

  @Get('/duplicates') // show duplicate subscribers
  getDuplicates() {}

  @Post('/create') // create/add a new subscriber
  createSubscriber() {}

  @Delete('/:id') // delete a subscriber by id
  deleteSubscriber() {}
}
