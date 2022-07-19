import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import SubscribersDto from './dto/subscribers.dto';
import SubscriberService from './__service';

@Controller('subscribers') // you can name your controller anything and this will be used as an endpoint prefix.
export default class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Get() // call all subscribers
  getSubscribers(@Query() query: { page: string; tag: string }) {
    return this.subscriberService.getSubscribers(Number(query.page), query.tag);
  }

  @Get('/:email') // to call a subscriber with email from database
  getSubscriber(@Param('email') email: string) {
    return this.subscriberService.getSubscriberByEmail(email);
  }

  @Get('/duplicates') // show duplicate subscribers
  getDuplicates() {
    return this.subscriberService.findDuplicateSubscribers();
  }

  @Post('/create') // create/add a new subscriber
  createSubscriber(@Body() data: SubscribersDto) {
    return this.subscriberService.createSubscribers(data);
  }

  @Delete('/:id') // delete a subscriber by id
  deleteSubscriber(@Param('id') id: string) {
    return this.subscriberService.deleteSubscriber(id);
  }
}
