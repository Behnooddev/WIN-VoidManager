import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../../roles/roles.service';
import { Request } from 'express';

interface PermissionMetadata {
  permission: string;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());

    if (!requiredPermission) {
      return true; // No permission required for this endpoint
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new UnauthorizedException('No session found');
    }

    const hasPerm = await this.roleService.hasPermission(user.userId, requiredPermission);
    if (!hasPerm) {
      throw new ForbiddenException(`Missing required permission: ${requiredPermission}`);
    }

    return true;
  }
}
