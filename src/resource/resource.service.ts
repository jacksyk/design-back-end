import { Injectable, Req } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Resource } from 'entities';

@Injectable()
export class ResourceService {
  @InjectEntityManager()
  private entityManager: EntityManager;
  async create(createResourceDto: CreateResourceDto, @Req() req: Request) {
    const userId = req['user_id'];

    await this.entityManager.save(
      Resource,
      Object.assign(createResourceDto, {
        userId,
      }),
    );
    return '上传成功';
  }

  async findAll(@Req() req: Request) {
    const userId = req['user_id'];

    return await this.entityManager.find(Resource, {
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });
  }

  findOne(@Req() req: Request) {
    const userId = req['user_id'];

    return this.entityManager.find(Resource, {
      where: {
        user: {
          id: userId,
        },
      },
    });
  }
}
