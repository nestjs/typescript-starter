import { Controller, Get, Param, Response } from '@nestjs/common';
import { SayComponent } from '../../shared/say.component';


@Controller()
export class HelloWorldController {

    constructor(
        public sayComp: SayComponent,
    ) { }

    @Get()
    helloWorld( @Response() res) {
        const message = this.sayComp.say('world');
        res.status(200).send(message);
    }

    @Get('/:name')
    helloName( @Param('name') name: string, @Response() res) {
        const message = this.sayComp.say(name);
        res.status(200).send(message);
    }

}
