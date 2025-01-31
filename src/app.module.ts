import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Activity } from 'entities';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { RedisModule } from './redis/redis.module';
import { ActivityModule } from './activity/activity.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'kang',
      database: 'mysql',
      entities: [User, Activity],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
