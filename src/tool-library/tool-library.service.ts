import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateToolDto } from './dto/create-tool.dto';
import { ToolLibrary, ToolLibraryTag } from '../../entities/index';

@Injectable()
export class ToolLibraryService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async createTag(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const isExit = await this.entityManager.findOne(ToolLibraryTag, {
      where: {
        name,
      },
    });

    if (isExit) {
      throw new ConflictException(`标签 "${name}" 已存在`);
    }

    await this.entityManager.save(ToolLibraryTag, {
      name,
    });
    return '创建成功';
  }

  async findAllTag() {
    const data = await this.entityManager.find(ToolLibraryTag);
    return data;
  }

  async deleteTag(tagId: number) {
    // 开启事务
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const tag = await transactionalEntityManager.findOne(ToolLibraryTag, {
          where: { id: tagId },
          relations: ['tools'], // 加载关联的工具
        });

        if (!tag) {
          throw new NotFoundException(`标签不存在`);
        }

        // 先删除中间表关联关系
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('tool_tags')
          .where('tag_id = :tagId', { tagId })
          .execute();

        // 再删除标签
        await transactionalEntityManager.delete(ToolLibraryTag, tagId);

        return '删除成功';
      },
    );
  }

  async createTool(createToolDto: CreateToolDto) {
    const { tagIds, description, link, title, type } = createToolDto;
    const tags = await this.entityManager.findBy(ToolLibraryTag, {
      id: In(tagIds),
    });

    await this.entityManager.save(ToolLibrary, {
      description,
      link,
      title,
      tags,
      type,
    });

    return '创建成功';
  }

  async findAllTool() {
    const data = await this.entityManager.find(ToolLibrary, {
      relations: ['tags'],
    });
    return data;
  }

  async deleteTool(toolId: number) {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const tool = await transactionalEntityManager.findOne(ToolLibrary, {
          where: { id: toolId },
          relations: ['tags'],
        });

        if (!tool) {
          throw new NotFoundException(`工具不存在`);
        }

        // 先删除中间表关联关系
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('tool_tags')
          .where('tool_id = :toolId', { toolId })
          .execute();

        // 再删除工具
        await transactionalEntityManager.delete(ToolLibrary, toolId);

        return '删除成功';
      },
    );
  }
}
