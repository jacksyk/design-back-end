import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User, UserRole } from '../../entities';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import { RedisClientType } from 'redis';

@Injectable()
export class LoginService {
  @InjectEntityManager()
  private manager: EntityManager;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { student_id } = loginDto;

    const user = await this.manager.findOne(User, {
      where: { student_id },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== loginDto.password) {
      throw new BadRequestException('密码错误');
    }

    const userWithoutPassword = omit(user, ['password']);

    const token = this.jwtService.sign(userWithoutPassword);

    await this.redisClient.set(user.id.toString(), token);

    return {
      message: '登录成功',
      token,
    };
  }

  async loginAdmin(loginDto: LoginDto) {
    const { student_id } = loginDto;

    const user = await this.manager.findOne(User, {
      where: { student_id },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== loginDto.password) {
      throw new BadRequestException('密码错误');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('用户不是管理员');
    }

    const userWithoutPassword = omit(user, ['password']);

    const token = this.jwtService.sign(userWithoutPassword);

    await this.redisClient.set(user.id.toString(), token);

    return {
      message: '登录成功',
      token,
    };
  }
}
