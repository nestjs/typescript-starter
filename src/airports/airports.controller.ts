import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import AirportsService from './airports.service';
import CreateAirportDto from './dto/createAirport.dto';

@Controller('airports')
export class AirportsController {
    constructor(private readonly airportsService: AirportsService) { }

    @Get()
    getAirports() {
        return this.airportsService.getAllAirports();
    }

    @Get(':id')
    getAirportById(@Param('id') id: string) {
        return this.airportsService.getAirportById(Number(id));
    }

    @Post()
    createAirport(@Body() airport: CreateAirportDto) {
        return this.airportsService.createAirport(airport);
    }

    @Delete(':id')
    removeAirport(@Param('id') id: string) {
        this.airportsService.removeAirport(Number(id));
    }
}