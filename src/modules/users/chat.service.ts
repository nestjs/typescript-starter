import { ChatGateway } from './chat.gateway';
import { Component } from 'nest.js';

@Component()
export class ChatService {

    constructor(private chatGateway: ChatGateway) {
        const stream$ = this.chatGateway.msgStream;
        stream$.subscribe(this.storeMessage.bind(this));
    }

    storeMessage(data) {
        // store data
    }

}