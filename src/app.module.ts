import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { RedisModule } from './redis/redis.module';
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
      entities: [User],
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: 'kang',
      signOptions: {
        expiresIn: '1s',
      },
    }),
    LoginModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
