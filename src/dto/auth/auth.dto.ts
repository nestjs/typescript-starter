import { ApiProperty } from '@nestjs/swagger';
export class UserLoginDto {
	@ApiProperty()
	username: string;
	@ApiProperty()
	password: string;
}
export class TokenPayloadDto {
	@ApiProperty()
	username: string
	@ApiProperty()
	userId: number
}