import { Component } from '@nestjs/common';


@Component()
export class SayComponent {
    say(name: string) {
        // This function capitalizes the name argument
        const capitalized = name.substr(0, 1).toUpperCase() + name.substr(1, name.length);
        return `Hello, ${capitalized}!`;
    }
}
