import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisClientType } from 'redis';
import { Reflector } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'entities';

@Injectable()

/** 登录鉴权守卫 */
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Inject()
  private reflector: Reflector;

  @InjectEntityManager()
  private entityManager: EntityManager;

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const NotRequireLogin = this.reflector.getAllAndOverride(
      'not-require-login',
      [context.getClass(), context.getHandler()],
    );

    if (NotRequireLogin) {
      return true;
    }

    const token = request.header('token') ?? '';

    if (!token) {
      throw new UnauthorizedException('未授权');
    }

    const tokenInfo = this.jwtService.decode(token);

    const { id }: { id: number } = tokenInfo;

    const requireAdmin = this.reflector.getAllAndOverride('require-admin', [
      context.getClass(),
      context.getHandler(),
    ]);

    // 如果需要管理员鉴权，查看当前用户的角色是否为管理员
    if (requireAdmin) {
      const userValue = await this.entityManager.findOne(User, {
        where: {
          id,
        },
      });

      if (!userValue) {
        throw new NotFoundException('用户不存在');
      }

      const { role = '' } = userValue;

      if (role !== 'admin') {
        throw new UnauthorizedException('权限不够');
      }
    }

    try {
      // verify 验证的是expire是否过期
      this.jwtService.verify(token);

      const user = await this.redisClient.get(id.toString());

      if (!user) {
        throw new UnauthorizedException('用户信息已过期,请重新登录');
      }

      request['user_id'] = id;

      return true;
    } catch {
      await this.redisClient.del(id.toString());
      throw new UnauthorizedException('token过期了,请重新登录');
    }
  }
}
