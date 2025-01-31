import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { info } from 'node:console';
import { TransformInterceptor } from '../common/response/response.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  info(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
