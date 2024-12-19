import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorators

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'The description of the todo',
    type: String,
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'The status of the todo',
    type: Boolean,
    default: false,
  })
  completed: boolean;
}
