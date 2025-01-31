import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisClientType } from 'redis';

@Controller()
export class AppController {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const value = await this.redisClient.get('kang');
    console.log('value', value);
    return this.appService.getHello();
  }
}
