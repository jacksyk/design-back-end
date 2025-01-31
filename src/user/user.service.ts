import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'entities';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  async findAll() {
    const [data, count] = await this.manager.findAndCount(User);
    return {
      data,
      totalCount: count,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { student_id } = createUserDto;
    const isExist = await this.manager.findOne(User, {
      where: { student_id },
    });

    if (isExist) {
      throw new BadRequestException('用户已存在');
    }

    const data = await this.manager.save(User, createUserDto);

    return data;
  }

  async findOne(id: number) {
    const data = await this.manager.findOne(User, { where: { id } });

    console.log(data);

    if (!data) {
      throw new BadRequestException('用户不存在');
    }

    return data;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.manager.update(User, id, updateUserDto);
  }

  remove(id: number) {
    return this.manager.delete(User, id);
  }
}
