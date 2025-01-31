import { Controller, Get, Body, Patch, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 获取所有用户信息 */
  @Get()
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
}
