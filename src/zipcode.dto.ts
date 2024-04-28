import { IsNotEmpty, IsNumber, IsNumberString, IsString, Length } from 'class-validator';

export class ZipcodeDto {
    @IsNotEmpty()
    @IsNumberString()
    @Length(5, 5)
    zipcode: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    stateAbbreviation: string;

    @IsString()
    county: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}