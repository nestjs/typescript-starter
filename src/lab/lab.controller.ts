import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabDto } from './dto/create-lab.dto';

@Controller('lab')
export class LabController {

    constructor(private readonly labService: LabService) { }

    @Get("hello")
    getHello(): string {
        return this.labService.getHello();
    }

    @Post('test-data')
    test(@Body() createLabDto: CreateLabDto) {
        return {
            message: 'Veri başarıyla doğrulandı!',
            receivedData: createLabDto,
        };
    }

    @Post()
    create(@Body() createLabDto: CreateLabDto) {
        return this.labService.create(createLabDto);
    }

    @Get()
    findAll() {
        return this.labService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.labService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.labService.remove(id);
    }
}