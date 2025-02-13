import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection, // 添加这个
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { EnterMessageDto } from './dto/enter-message.dto';
import { Server, Socket } from 'socket.io'; // 修改这行

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  // key:id value:username
  map: Map<
    string,
    {
      username: string;
    }
  >;

  constructor(private readonly websocketService: WebsocketService) {
    this.map = new Map();
  }

  handleConnection(client: Socket) {
    // 进入的时候就监听enter
    client.on('enter', async (data: EnterMessageDto) => {
      this.map.set(client.id, data);
      await this.websocketService.enter(data, this.server);
    });
    // 在连接时添加断开连接的监听
    client.on('disconnect', async () => {
      const leaveData = this.map.get(client.id);
      if (leaveData) {
        await this.websocketService.leave(leaveData, this.server);
        this.map.delete(client.id);
      }
      // Logger.error('断开连接！！！', client.id);
      // if (this.server) {
      // this.server.emit('system', {
      //   message: `用户离开了聊天室`,
      //   timestamp: new Date(),
      // });
      // this.websocketService.handleDisconnect(this.server);
      // }
    });
  }
  @SubscribeMessage('sendMessage')
  create(@MessageBody() createWebsocketDto: CreateWebsocketDto) {
    return this.websocketService.create(createWebsocketDto, this.server);
  }
}
