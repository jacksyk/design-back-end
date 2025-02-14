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
    const isExit = await this.entityManager.findOne(ToolLibraryTag, {
      where: {
        id: tagId,
      },
    });
    if (!isExit) {
      throw new NotFoundException(`标签不存在`);
    }

    await this.entityManager.delete(ToolLibraryTag, {
      id: tagId,
    });

    return '删除成功';
  }

  async createTool(createToolDto: CreateToolDto) {
    const { tagIds, description, icon, link, title } = createToolDto;
    const tags = await this.entityManager.findBy(ToolLibraryTag, {
      id: In(tagIds),
    });

    await this.entityManager.save(ToolLibrary, {
      description,
      icon,
      link,
      title,
      tags,
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
    const isExit = await this.entityManager.findOne(ToolLibrary, {
      where: {
        id: toolId,
      },
    });
    if (!isExit) {
      throw new NotFoundException(`工具不存在`);
    }

    await this.entityManager.delete(ToolLibrary, {
      id: toolId,
    });

    return '删除成功';
  }
}
