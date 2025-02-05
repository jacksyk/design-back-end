import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { LoginGuard } from 'common/guard/login.guard';
import { ReplayFeedbackDto } from './dto/replay-feedback';

@UseGuards(LoginGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Req() req: Request) {
    return this.feedbackService.create(createFeedbackDto, req);
  }

  @Get('/all')
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get()
  findOne(@Req() req: Request) {
    return this.feedbackService.findOne(req);
  }

  @Delete(':feedbackId')
  remove(@Param('feedbackId') id: string) {
    return this.feedbackService.remove(+id);
  }

  @Get('/reply')
  getReplyFeedback(@Req() request: Request) {
    return this.feedbackService.reply(request);
  }

  @Get('/read/:id')
  read(@Param('id') id: string) {
    return this.feedbackService.read(+id);
  }

  @Post('/reply')
  sendReply(@Body() body: ReplayFeedbackDto) {
    return this.feedbackService.sendReply(body);
  }

  /** 获取一个用户所有的feedback */
  @Get('/person')
  findPersonFeedback(@Req() request: Request) {
    return this.feedbackService.findPersonFeedback(request);
  }
}
