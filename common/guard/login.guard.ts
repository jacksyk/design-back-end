import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisClientType } from 'redis';

@Injectable()

/** 登录鉴权守卫 */
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.header('token') ?? '';

    if (!token) {
      throw new UnauthorizedException('未授权');
    }

    const tokenInfo = this.jwtService.decode(token);

    const { id }: { id: number } = tokenInfo;

    try {
      // verify 验证的是expire是否过期
      this.jwtService.verify(token);

      const user = await this.redisClient.get(id.toString());

      if (!user) {
        throw new UnauthorizedException('用户信息已过期,请重新登录');
      }

      return true;
    } catch {
      await this.redisClient.del(id.toString());
      throw new UnauthorizedException('token过期了,请重新登录');
    }
  }
}
