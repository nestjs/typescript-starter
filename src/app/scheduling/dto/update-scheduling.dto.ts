import { PartialType } from '@nestjs/swagger';
import { CreateSchedulingDto } from './create-scheduling.dto';

export class UpdateSchedulingDto extends PartialType(CreateSchedulingDto) {}
