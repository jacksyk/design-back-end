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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 获取所有用户信息 */
  @Get()
  @UseGuards(LoginGuard)
  findAll() {
    return this.userService.findAll();
  }

  /** 创建新用户 */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /** 获取单个用户信息 */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  /** 更新某个用户信息 */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.findOne(id);
    return this.userService.update(+id, Object.assign(data, updateUserDto));
  }

  @Get('likes/:id')
  @UseGuards(LoginGuard)
  likes(@Param('id') id: string, @Req() req: Request) {
    return this.userService.likes(+id, req);
  }

  @Get('collections/:id')
  @UseGuards(LoginGuard)
  collections(@Param('id') id: string, @Req() req: Request) {
    return this.userService.collections(+id, req);
  }

  @Get('views/:id')
  @UseGuards(LoginGuard)
  views(@Param('id') id: string) {
    return this.userService.views(+id);
  }
}
