// src/event/dto/update-event.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  bannerId?: string;
}
