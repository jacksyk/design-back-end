import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginGuard } from 'common/guard/login.guard';
import { NotRequireLogin, RequireAdmin } from 'common/decorator';
@UseGuards(LoginGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 获取单个用户信息 */
  @Get()
  findOne(@Req() request: Request) {
    const userId = request['user_id'];
    return this.userService.findOne(+userId);
  }

  /** 获取所有用户信息 */
  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  /** 创建新用户 */
  @Post()
  @NotRequireLogin()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /** 更新某个用户信息 */
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() request: Request) {
    const userId = request['user_id'];
    return this.userService.update(+userId, updateUserDto);
  }

  /** 删除某个用户 */
  @RequireAdmin()
  @Get('delete/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  /** 封禁某个用户 */
  @RequireAdmin()
  @Get('ban/:id')
  ban(@Param('id') id: string) {
    return this.userService.ban(+id);
  }

  /** 获取用户身份信息 */
  @Get('/identity')
  getIdentity(@Req() req: Request) {
    return this.userService.getIdentity(req);
  }

  /** 模糊搜索 */
  @Get('search/:keyword')
  search(@Param('keyword') keyword: string) {
    return this.userService.search(keyword);
  }

  /** 点赞 */
  @UseGuards(LoginGuard)
  @Get('likes/:id')
  likes(@Param('id') id: string, @Req() req: Request) {
    return this.userService.likes(+id, req);
  }

  /** 收藏 */
  @UseGuards(LoginGuard)
  @Get('collections/:id')
  collections(@Param('id') id: string, @Req() req: Request) {
    return this.userService.collections(+id, req);
  }

  /** 浏览 */
  @Get('views/:id')
  views(@Param('id') id: string, @Req() req: Request) {
    return this.userService.views(+id, req);
  }
}
