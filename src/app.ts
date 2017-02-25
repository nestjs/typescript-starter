import { NestApplication } from 'nest.js';

export class Application implements NestApplication {
    constructor(private expressApp) {}

    start() {
        // do something before server start
        this.expressApp.listen(3031, () => {
            console.log('Application listen on port:', 3031);
        });
    }
}