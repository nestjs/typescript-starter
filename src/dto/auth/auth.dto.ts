import { ApiProperty } from '@nestjs/swagger';
export class UserLoginDto {
	@ApiProperty()
	username: string;
	@ApiProperty()
	password: string;
}