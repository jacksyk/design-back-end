import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from '../entities/user-activity.entity';
import { Comment } from '../entities/comment.entity';
import { FeedBack } from '../entities/feedback.entity';
import { Resource } from '../entities/resource.entity';
import { ResourceClassify } from '../entities/resource-classify.entity';
import { Email } from '../entities/email.entity';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { ToolLibrary } from '../entities/tool-library.entity';
import { ToolLibraryTag } from '../entities/tool-library-tag.entity';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { RedisModule } from './redis/redis.module';
import { ActivityModule } from './activity/activity.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommentModule } from './comment/comment.module';
import { UploadModule } from './upload/upload.module';
import { SseModule } from './sse/sse.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ResourceModule } from './resource/resource.module';
import { ResourceClassifyModule } from './resource-classify/resource-classify.module';
import { EmailModule } from './email/email.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ToolLibraryModule } from './tool-library/tool-library.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.NODE_ENV === 'production' ? 'db' : 'localhost',
      port: 3306,
      username: 'root',
      password: 'kang',
      database: 'mysql',
      // 注册所有实体
      entities: [
        User,
        Activity,
        UserActivity,
        Comment,
        FeedBack,
        Resource,
        ResourceClassify,
        Email,
        ToolLibrary,
        ToolLibraryTag,
      ],
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: 'kang',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    LoginModule,
    RedisModule,
    ActivityModule,
    TaskModule,
    ScheduleModule.forRoot(),
    CommentModule,
    UploadModule,
    SseModule,
    FeedbackModule,
    ResourceModule,
    ResourceClassifyModule,
    EmailModule,
    WebsocketModule,
    ToolLibraryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
