import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { EnterMessageDto } from './dto/enter-message.dto';
import { Server } from 'http';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway {
  /** 消息队列 */
  private bufferMessage = [];

  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  @SubscribeMessage('sendMessage')
  create(@MessageBody() createWebsocketDto: CreateWebsocketDto) {
    return this.websocketService.create(createWebsocketDto, this.server);
  }

  @SubscribeMessage('enter')
  enter(@MessageBody() enterMessage: EnterMessageDto) {
    return this.websocketService.enter(enterMessage, this.server);
  }

  @SubscribeMessage('leave')
  leave(@MessageBody() enterMessage: EnterMessageDto) {
    return this.websocketService.leave(enterMessage, this.server);
  }
}
