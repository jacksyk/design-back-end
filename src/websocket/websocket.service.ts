import { Inject, Injectable } from '@nestjs/common';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { UpdateWebsocketDto } from './dto/update-websocket.dto';
import { EnterMessageDto } from './dto/enter-message.dto';
import { Server } from 'http';
import { RedisClientType } from 'redis';
@Injectable()
export class WebsocketService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  private count: number = 0;

  async create(createWebsocketDto: CreateWebsocketDto, server: Server) {
    const { content, timestamp } = createWebsocketDto;

    await this.redisClient.lPush(
      'socketQueue',
      JSON.stringify({
        content,
        timestamp,
      }),
    );

    server.emit('message', {
      content,
      timestamp,
    });

    // this.bufferMessage.push({
    //   content,
    //   timeStamp,
    //   username,
    // });
    return 'This action adds a new websocket';
  }

  findAll() {
    return `This action returns all websocket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} websocket`;
  }

  update(id: number, updateWebsocketDto: UpdateWebsocketDto) {
    return `This action updates a #${id} websocket`;
  }

  remove(id: number) {
    return `This action removes a #${id} websocket`;
  }

  enter(body: EnterMessageDto, server: Server) {
    const { username } = body;

    // console.log('userName', username, body);
    server.emit('system', {
      message: `${username}进入聊天室`,
    });
    this.count++;
    server.emit('count', {
      count: this.count,
    });
    return;
  }

  leave(body: EnterMessageDto, server: Server) {
    const { username } = body;
    console.log('leave');
    server.emit('system', {
      message: `${username}离开聊天室`,
    });
    this.count--;
    server.emit('count', {
      count: this.count,
    });
    return;
  }
}
