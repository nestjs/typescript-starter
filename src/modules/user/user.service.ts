import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@services';
import { Response } from '@shared';
import { verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';

@Injectable()
class UserService {
  /**
   * Logger instance
   */
  private readonly l = new Logger('UserService', true);
  /**
   * Inject dependencies
   */
  constructor(
    @InjectRepository(User) private readonly userTable: Repository<User>,
  ) {}

  /**
   * Get user information
   */
  public async info(jwt: string): Promise<Response> {
    if (!jwt) {
      this.l.log('You are unauthorized to perform this action');
      throw new InternalServerErrorException(
        'You are unauthorized to perform this action',
      );
    }

    /**
     * Check if jwt expired
     */
    //TODO: environment.jwtSecret (proccess.env variables always undefined)
    const verification = verify(jwt, 'somesecret', (err, decoded) => {
      if (err) {
        this.l.log(err);
        throw new InternalServerErrorException(err);
      } else {
        return decoded;
      }
    }) as any;

    try {
      const user = await this.userTable.findOne({ id: verification?.userId });

      if (user) {
        return new Response({ message: 'ok', data: user, status: true });
      } else {
        this.l.log('User not found');
        throw new InternalServerErrorException('User not found');
      }
    } catch (error) {
      this.l.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

export { UserService };
