import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  constructor(
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  async login(email: string, pass: string, request?: Request) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      await this.auditService.logEvent({
        eventType: 'auth.login.failure',
        result: 'FAILURE',
        metadata: { email },
      }, request);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.userService.verifyPassword(user.passwordHash, pass);
    if (!isValid) {
      await this.auditService.logEvent({
        eventType: 'auth.login.failure',
        actorId: user.id,
        result: 'FAILURE',
      }, request);
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = uuidv4();
    const sessionData = {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      'EX', 86400,
    );

    // Maintain a set of active sessions for the user
    await this.redis.sadd(`user_sessions:${user.id}`, sessionId);

    await this.auditService.logEvent({
      eventType: 'auth.login.success',
      actorId: user.id,
      result: 'SUCCESS',
    }, request);

    return { sessionId };
  }

  async validateSession(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  async logout(sessionId: string, request?: Request) {
    const session = await this.validateSession(sessionId);
    const userId = session?.userId;

    await this.redis.del(`session:${sessionId}`);
    if (userId) {
      await this.redis.srem(`user_sessions:${userId}`, sessionId);
    }

    if (userId) {
      await this.auditService.logEvent({
        eventType: 'auth.logout',
        actorId: userId,
        result: 'SUCCESS',
      }, request);
    }
  }

  async getUserSessions(userId: string) {
    const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
    const sessions = [];

    for (const sid of sessionIds) {
      const data = await this.redis.get(`session:${sid}`);
      if (data) {
        sessions.push({
          sessionId: sid,
          ...JSON.parse(data),
        });
      } else {
        // Cleanup expired session from the set
        await this.redis.srem(`user_sessions:${userId}`, sid);
      }
    }

    return sessions;
  }

  async revokeSession(sessionId: string, request?: Request) {
    const session = await this.validateSession(sessionId);
    if (!session) return;

    await this.redis.del(`session:${sessionId}`);
    await this.redis.srem(`user_sessions:${session.userId}`, sessionId);

    await this.auditService.logEvent({
      eventType: 'auth.session_revoke',
      actorId: session.userId,
      targetId: sessionId,
      result: 'SUCCESS',
    }, request);
  }
}
