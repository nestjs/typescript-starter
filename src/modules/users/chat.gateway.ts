import { Subject } from 'rxjs/Subject';
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from 'nest.js/websockets';

@WebSocketGateway({ port: 2000 })
export class ChatGateway {
    private msg$ = new Subject<any>();

    @WebSocketServer()
    server;

    get msgStream() {
        return this.msg$.asObservable();
    }

    @SubscribeMessage({ value: 'message' })
    onMessage(client, data) {
        this.msg$.next({ client, data });
    }

}