import { Module } from "@nestjs/common";
import { AirportsController } from "./airports.controller";
import AirportsService from "./airports.service";

@Module({
    imports: [],
    controllers: [AirportsController],
    providers: [AirportsService],
})
export class AirportsModule { }