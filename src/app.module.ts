import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Activity, UserActivity, Comment } from 'entities';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { RedisModule } from './redis/redis.module';
import { ActivityModule } from './activity/activity.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommentModule } from './comment/comment.module';
import { UploadModule } from './upload/upload.module';
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
      entities: [User, Activity, Comment, UserActivity],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
