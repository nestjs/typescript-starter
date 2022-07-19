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

  async findDuplicateSubscribers() {
    const subscribers: Subscriber[] = await this.subscriberRepository.find();
    const alreadySeen = []; // for finding duplicates
    const duplicates = []; // for storing and displaying duplicates
    subscribers.forEach((sbs) =>
      alreadySeen[sbs.email]
        ? duplicates.push(sbs.email)
        : (alreadySeen[sbs.email] = true),
    );

    if (duplicates.length) return duplicates;
    return { message: 'No duplicates found' };
  }

  async getSubscriberByEmail(email: string) {
    const subscriber = await this.subscriberRepository.find({
      where: { email },
    });
    return subscriber;
  }

  async getSubscribers(page: number, tag: string) {
    const pageSize = 20;
    const [subscribers, count] = await this.subscriberRepository.findAndCount({
      skip: ((page ? page : 1) - 1) * 20, // if page number is provided then query will skip 20 items
      take: pageSize, // default page size - can be set to any number. less than 20 is recommended
      order: {
        name: 'ASC',
      },
      where: {
        subscribed: true, // only returns subscribers who haven`t unsubscribed from our campaigns
        tag, // to filter out only a specific category of subscribers
      },
    });
    return {
      object: 'subscribers',
      data: subscribers,
      total: count,
      limit: pageSize,
      page,
    };
  }

  async deleteSubscriber(id: string) {
    return this.subscriberRepository.delete(id);
  }
}
