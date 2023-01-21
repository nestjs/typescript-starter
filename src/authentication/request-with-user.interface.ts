import { Request } from 'express';
import User from '../users/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
