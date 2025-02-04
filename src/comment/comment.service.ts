import { Injectable, Req } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Comment } from 'entities';
@Injectable()
export class CommentService {
  @InjectEntityManager()
  private manager: EntityManager;

  async create(createCommentDto: CreateCommentDto, @Req() req: Request) {
    const userId = req['user_id'];
    const { activityId, content } = createCommentDto;

    const comment = await this.manager.save(Comment, {
      content,
      userId,
      activityId: {
        id: activityId,
      },
    });

    return {
      message: '评论成功',
      data: comment,
    };
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(articleId: number) {
    return this.manager.find(Comment, {
      where: {
        activityId: {
          id: articleId,
        },
      },
      relations: ['userId'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
