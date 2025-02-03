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
import { SearchActivityDto, CreateActivityDto } from './dto';
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

  /** 查询某个用户的活动记录 */
  @UseGuards(LoginGuard)
  @Get('user')
  findByUserId(@Req() request: Request) {
    // return 'hello';
    return this.activityService.findByUserId(request);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }

  @Post('/search')
  search(@Body() searchActivityDto: SearchActivityDto) {
    return this.activityService.search(searchActivityDto);
  }
}
