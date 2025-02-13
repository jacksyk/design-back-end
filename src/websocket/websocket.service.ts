import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { EnterMessageDto } from './dto/enter-message.dto';
import { Server } from 'socket.io';
import { RedisClientType } from 'redis';

@Injectable()
export class WebsocketService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  private readonly CHAT_COUNT_KEY = 'chatroom:userCount';

  // 获取当前人数
  private async getCurrentCount(): Promise<number> {
    const count = await this.redisClient.get(this.CHAT_COUNT_KEY);
    return count ? parseInt(count) : 0;
  }

  // 更新人数
  private async updateCount(count: number): Promise<void> {
    await this.redisClient.set(this.CHAT_COUNT_KEY, count.toString());
  }

  async create(createWebsocketDto: CreateWebsocketDto, server: Server) {
    const { content, timestamp } = createWebsocketDto;
    await this.redisClient.lPush(
      'socketQueue',
      JSON.stringify({ content, timestamp }),
    );
    server.emit('message', { content, timestamp });
  }

  async enter(body: EnterMessageDto, server: Server) {
    const { username } = body;
    server.emit('system', {
      message: `${username}进入聊天室`,
    });

    const currentCount = await this.getCurrentCount();
    const newCount = currentCount + 1;
    await this.updateCount(newCount);

    Logger.debug('当前人数:', newCount);
    server.emit('count', { count: newCount });
  }

  async leave(body: EnterMessageDto, server: Server) {
    const { username } = body;
    server.emit('system', {
      message: `${username}离开聊天室`,
    });

    const currentCount = await this.getCurrentCount();
    const newCount = Math.max(0, currentCount - 1); // 确保不会小于01
    await this.updateCount(newCount);

    server.emit('count', { count: newCount });
  }

  async countTheNumberOfPeople(server: Server) {
    const count = await this.getCurrentCount();
    server.emit('count', { count });
  }
}
