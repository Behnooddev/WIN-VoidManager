import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

export interface AuditEvent {
  eventType: string;
  actorId?: string;
  targetId?: string;
  result: 'SUCCESS' | 'FAILURE';
  metadata?: any;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(event: AuditEvent, request?: Request) {
    const ipAddress = request?.ip || request?.headers['x-forwarded-for'] || 'unknown';
    const userAgent = request?.headers['user-agent'] || 'unknown';

    return this.prisma.auditLog.create({
      data: {
        eventType: event.eventType,
        actorId: event.actorId,
        targetId: event.targetId,
        result: event.result,
        ipAddress,
        userAgent,
        metadata: event.metadata,
      },
    });
  }
}
