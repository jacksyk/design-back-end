import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { info } from 'node:console';
import { TransformInterceptor } from 'common/interceptor/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useGlobalInterceptors(new TransformInterceptor());
  // 配置静态资源目录
  app.useStaticAssets('public', {
    prefix: '/static',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  info(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
