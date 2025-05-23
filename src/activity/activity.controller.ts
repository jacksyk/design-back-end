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

  @Get('/campus/all')
  getAllCampus() {
    return this.activityService.getAllCampus();
  }

  @Get('/academic/all')
  getAllAcademic() {
    return this.activityService.getAllAcademic();
  }

  @Get('/tutor/all')
  getAllTutor() {
    return this.activityService.getAllTutor();
  }

  /** 查询某个用户的活动记录 */
  @UseGuards(LoginGuard)
  @Get('user')
  findByUserId(@Req() request: Request) {
    return this.activityService.findByUserId(request);
  }

  /** 这个依赖于用户的登录状态 */
  @UseGuards(LoginGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.activityService.findOne(+id, request);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }

  @Post('/search')
  search(@Body() searchActivityDto: SearchActivityDto) {
    return this.activityService.search(searchActivityDto);
  }

  @Get('/searchKeyword/:keyword')
  searchByKeyword(@Param('keyword') keyword: string) {
    return this.activityService.searchByKeyword(keyword);
  }
}
