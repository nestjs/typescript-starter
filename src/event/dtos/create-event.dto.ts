export class CreateEventDto {
  location: string;
  title: string;
  description?: string;
  organizerId: string;
  date: Date;
  volunteerId: string;
  price: number;
}
