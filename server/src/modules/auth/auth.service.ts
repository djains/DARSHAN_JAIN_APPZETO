import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from './user.model.js';
import { env } from '../../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../errors/appErrors.js';
import { JwtPayload } from '../../middleware/auth.js';

export class AuthService {
  private static generateToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  static async register(data: { name: string; email: string; password: string; role?: 'USER' | 'ADMIN' }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'USER',
    });

    const token = this.generateToken(user);
    return { token, user };
  }

  static async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);
    return { token, user };
  }

  static async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }
}
