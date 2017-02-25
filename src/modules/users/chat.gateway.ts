import { Subject } from 'rxjs/Subject';
import { SocketGateway, GatewayServer, SubscribeMessage } from 'nest.js/socket';

@SocketGateway({ port: 2000 })
export class ChatGateway {
    private msg$ = new Subject<any>();

    @GatewayServer server;

    get msgStream() {
        return this.msg$.asObservable();
    }

    @SubscribeMessage({ value: 'message' })
    onMessage(client, data) {
        this.msg$.next({ client, data });
    }

}