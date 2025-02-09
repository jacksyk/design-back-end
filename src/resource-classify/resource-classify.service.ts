import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceClassifyDto } from './dto/create-resource-classify.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ResourceClassify } from '../../entities';

@Injectable()
export class ResourceClassifyService {
  @InjectEntityManager()
  private manager: EntityManager;

  async create(createResourceClassifyDto: CreateResourceClassifyDto) {
    await this.manager.save(ResourceClassify, createResourceClassifyDto);
    return '创建成功';
  }

  findAll() {
    return this.manager.find(ResourceClassify);
  }

  async remove(id: number) {
    const tag = await this.manager.findOne(ResourceClassify, {
      where: {
        id,
      },
    });

    if (!tag) {
      throw new NotFoundException('没有这个资源');
    }

    await this.manager.remove(ResourceClassify, tag);
    return `删除成功`;
  }
}
