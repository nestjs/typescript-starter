import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import IAirport from './airports.interface';
import CreateAirportDto from './dto/createAirport.dto';

@Injectable()
export default class AirportsService {
    private lastAirportId = 0;
    private airports: IAirport[] = [];

    getAllAirports() {
        return this.airports;
    }

    getAirportById(id: number) {
        const foundAirport = this.airports.find(airport => airport.id === id);

        if (foundAirport) {
            return foundAirport;
        }

        throw new HttpException('Airport not found', HttpStatus.NOT_FOUND);
    }

    createAirport(airport: CreateAirportDto) {
        const newAirport = {
            id: ++this.lastAirportId,
            ...airport,
        }

        this.airports.push(newAirport);

        return newAirport;
    }

    removeAirport(id: number) {
        const airportIndex = this.airports.findIndex(
            airport => airport.id === id
        );

        if (airportIndex > -1) {
            this.airports.splice(airportIndex, 1);
        } else {
            throw new HttpException(
                'Post not found', HttpStatus.NOT_FOUND
            );
        }
    }
}