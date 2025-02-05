import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, IsNull, Not } from 'typeorm';
import { FeedBack } from 'entities';
import { ReplayFeedbackDto } from './dto/replay-feedback';

@Injectable()
export class FeedbackService {
  @InjectEntityManager()
  private manager: EntityManager;

  async create(createFeedbackDto: CreateFeedbackDto, @Req() req: Request) {
    const { content, title } = createFeedbackDto;
    const userId = req['user_id'];

    await this.manager.save(FeedBack, {
      content,
      title,
      userId,
    });

    return '反馈成功';
  }

  findAll() {
    return this.manager.find(FeedBack, {
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(@Req() req: Request) {
    const userId = req['user_id'];
    return this.manager.find(FeedBack, {
      where: {
        userId,
      },
    });
  }

  async remove(id: number) {
    const feedback = await this.manager.findOne(FeedBack, {
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('反馈不存在');
    }

    await this.manager.remove(FeedBack, feedback);
    return '删除成功';
  }

  async reply(@Req() req: Request) {
    const userId = req['user_id'];
    const [data, totalCount] = await this.manager.findAndCount(FeedBack, {
      where: {
        userId,
        reply: Not(IsNull()),
        status: 'resolved',
      },
    });

    return {
      data,
      totalCount,
    };
  }

  async read(@Param() id: number) {
    await this.manager.update(
      FeedBack,
      {
        id,
      },
      {
        status: 'readed',
      },
    );

    return '标为已读';
  }

  async sendReply(@Body() body: ReplayFeedbackDto) {
    const { id, reply } = body;

    const feedback = await this.manager.findOne(FeedBack, {
      where: { id },
    });

    console.log('id', id);

    if (!feedback) {
      throw new NotFoundException('反馈不存在');
    }

    // 反馈状态不对
    if (feedback.status !== 'pending') {
      throw new BadRequestException('已经反馈过了，不应出现');
    }

    await this.manager.update(
      FeedBack,
      {
        id,
      },
      {
        reply,
        status: 'resolved',
      },
    );

    return '回复成功';
  }
}
