import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, Event } from '@prisma/client';
import axios from 'axios';
import { randomUUID } from 'crypto';

export interface CreateEventDto {
  location: string;
  title: string;
  description?: string;
  organizerId: string;
  date: Date; // Alterado para string, representando a data no formato ISO-8601
  volunteerId: string;
}

@Injectable()
export class EventService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreateEventDto): Promise<Event> {
    if (!data.location || !data.title ) {
      throw new BadRequestException('Missing required fields');
    }
    return this.prisma.event.create({
      data: {
        location: data.location,
        title: data.title,
        description: data.description || null,
        organizerId: data.organizerId,
        date: new Date(data.date), // Convertendo a string para um objeto Date
        volunteerId: data.volunteerId,
      },
    });
  }

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany();
  }

  async findOne(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id } });
  }

  async pay(id: string): Promise<void | Error> {
    try {
      const event = await this.prisma.event.findUnique({ where: { id } });
      if (!event) {
        throw new Error('Event not found');
      }

      const options = {
        method: 'POST',
        url: 'https://sandbox.api.pagseguro.com/checkouts',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
          'Content-type': 'application/json',
        },
        data: {
          reference_id: randomUUID(),
          expiration_date: Date.now() + 5 * 60 * 1000,
          customer_modifiable: true,
          items: [
            {
              reference_id: event.id,
              name: event.title,
              quantity: 1,
              unit_amount: event.price,
              image_url: event.image_url,
            },
          ],
          additional_amount: 0,
          discount_amount: 0,
          payment_methods: [
            { type: 'CREDIT_CARD', brands: ['mastercard', 'visa'] },
            { type: 'DEBIT_CARD', brands: ['visa', 'mastercard'] },
            { type: 'PIX' },
          ],
          payment_methods_configs: [
            {
              type: 'CREDIT_CARD',
              config_options: [{ option: 'INSTALLMENTS_LIMIT', value: '3' }],
            },
          ],
          soft_descriptor: 'ConnecTech',
          redirect_url: '',
          return_url: 'https://pagseguro.uol.com.br',
        },
      };

      axios
        .request(options)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.error(error.response.data);
        });
    } catch (error) {
      throw new Error('Error while processing payment');
    }
  }
}
