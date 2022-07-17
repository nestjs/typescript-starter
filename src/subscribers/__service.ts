import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import SubscribersDto, { Subscriber } from './dto/subscribers.dto';
import { InjectRepository } from '@nestjs/typeorm';
import SubscriberEntity from './__entity';
import { Repository } from 'typeorm';
import { nanoid } from 'src/nanoid/nanoid';

@Injectable()
export default class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);
  constructor(
    @InjectRepository(SubscriberEntity)
    private subscriberRepository: Repository<SubscriberEntity>,
  ) {}

  createSubscribers(data: SubscribersDto) {
    const { tag, subscribers } = data; // destructuring the request body

    subscribers.forEach(async (sbs: Subscriber) => {
      const subscriber = this.subscriberRepository.create({
        id: `sbs_${nanoid()}`, // assigning a unique id to the primary key
        email: sbs.email,
        name: sbs.name,
        tag, // category under which our subscriber falls into
      });

      try {
        await this.subscriberRepository.save(subscriber); // saves the subscriber into database
      } catch (error) {
        this.logger.error(error.code, error.stack); // throw and log errors if any
        throw new InternalServerErrorException();
      }
    });
    return { message: 'Subscribers added' };
  }
}
