import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsArray,
} from 'class-validator';

export class CreateEventDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(['TODO', 'IN_PROGRESS', 'COMPLETED'])
    status: string;

    @IsString()
    startTime: Date;

    @IsString()
    endTime: Date;

    @IsArray()
    @IsNumber({}, { each: true })
    invitees: number[];
}
