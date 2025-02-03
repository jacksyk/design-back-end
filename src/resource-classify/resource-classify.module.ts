import { Module } from '@nestjs/common';
import { ResourceClassifyService } from './resource-classify.service';
import { ResourceClassifyController } from './resource-classify.controller';

@Module({
  controllers: [ResourceClassifyController],
  providers: [ResourceClassifyService],
})
export class ResourceClassifyModule {}
