import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm'
import { Token } from './token.entity';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
    ) {}

    async createToken(length: number = 16): Promise<string> {
        const value = randomBytes(length).toString('hex')

        const token = this.tokenRepository.create({ value })
        await this.tokenRepository.save(token)

        return value
    }

    async isValid(value: string): Promise<boolean> {
        const token = await this.tokenRepository.findOne({ where: { value } })

        return process.env.APP_URL?.includes("localhost") ? true : !!token
    }

    async removeToken(value: string): Promise<void> {
        await this.tokenRepository.delete({ value })
    }
}