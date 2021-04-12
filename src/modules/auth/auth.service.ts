import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Security, User } from '@services';
import { SigninDto, SignupDto } from '@shared';
import { genSaltSync, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
class AuthService {
  /**
   * Logger instance
   */
  private readonly l = new Logger('AuthService', true);
  /**
   * Inject dependencies
   */
  constructor(
    @InjectRepository(User) private readonly userTable: Repository<User>,
    @InjectRepository(Security)
    private readonly securityTable: Repository<Security>,
  ) {}

  /**
   * Hash password
   */
  protected async hashPassword(
    password: string,
    salt: string,
  ): Promise<string> {
    return hash(password, salt);
  }

  /**
   * Sign user up
   */
  public async signup(body: SignupDto): Promise<{ success: boolean }> {
    const { email } = body;
    /**
     * First - check if user with this email already exists
     */
    const exists = await this.userTable.findOne({ email });

    if (exists) {
      throw new Error('User with this email already exists');
    }

    /**
     * Generate salt
     */
    const salt = genSaltSync(15);

    this.l.debug('Generated salt');

    const userId = uuidv4();

    const hashedPassword = await this.hashPassword(body.password, salt);

    const user = {
      userId,
      ...body,
    };

    const { id } = await this.userTable.save(user);

    await this.securityTable.insert({
      user: { id },
      password: hashedPassword,
      salt,
    });

    this.l.verbose('User saved');

    const result = {
      success: true,
    };

    return result;
  }

  /**
   * Sign user in
   */
  public async signin({
    email,
    password,
  }: SigninDto): Promise<{
    status: boolean;
    token?: string;
    message?: string;
  }> {
    const security = await this.securityTable
      .createQueryBuilder('security')
      .leftJoinAndSelect('security.user', 'user')
      .where('user.email = :email', { email })
      .getOne();

    if (!security) {
      throw new Error('User with this email does not exist');
    } else {
      this.l.log('User found');
      /**
       * Create hash to check pass
       */
      const passHash = await hash(password, security.salt);
      /**
       * Compare hash with password
       */
      const isPasswordCorrect = passHash === security.password;

      if (!isPasswordCorrect) {
        throw new Error('Password is incorrect');
      }

      this.l.log('Authorization proccess completed, issuing token');

      const token = jwt.sign(
        {
          userId: security.user.id,
        },
        //TODO: environment.jwtSecret (proccess.env variables always undefined)
        'somesecret',
        { expiresIn: '50s' },
      );
      return {
        token,
        status: true,
      };
    }
  }
}

export { AuthService };
