import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { LoginGuard } from 'common/guard/login.guard';
import { GetQueryDto } from './dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(LoginGuard)
  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Req() request: Request,
  ) {
    const user_id = request['user_id'];

    console.log('user_id', user_id);

    Object.assign(createActivityDto, {
      start_time: new Date(createActivityDto.start_time),
      end_time: new Date(createActivityDto.end_time),
      user_id,
    });

    return this.activityService.create(createActivityDto);
  }

  @Get()
  findAll(@Query() query: GetQueryDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }

  @Get('likes/:id')
  likes(@Param('id') id: string) {
    return this.activityService.likes(+id);
  }

  @Get('views/:id')
  views(@Param('id') id: string) {
    return this.activityService.views(+id);
  }

  @Get('collections/:id')
  collections(@Param('id') id: string) {
    return this.activityService.collections(+id);
  }
}
