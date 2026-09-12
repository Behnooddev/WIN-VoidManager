import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  constructor(private readonly userService: UserService) {}

  async login(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.userService.verifyPassword(user.passwordHash, pass);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = uuidv4();
    const sessionData = {
      userId: user.id,
      email: user.email,
    };

    // Store session in Redis for 24 hours
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      'EX', 86400,
    );

    return { sessionId };
  }

  async validateSession(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  async logout(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
  }
}
