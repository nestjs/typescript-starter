import { IsString, MinLength } from "class-validator";

export class CreateLabDto {
    @IsString()
    name: string;
    @MinLength(3,{ message : "En az 3 karakter olmalı"})
    description: string;
}