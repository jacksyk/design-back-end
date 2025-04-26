import { Injectable, Logger } from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Performance } from '../../entities';

@Injectable()
export class PerformanceService {
  @InjectEntityManager()
  private manager: EntityManager;

  async create(createPerformanceDto: CreatePerformanceDto) {
    await this.manager.save(Performance, createPerformanceDto);
    return '收集成功';
  }

  async findAll() {
    const [data, count] = await this.manager.findAndCount(Performance);
    return {
      data,
      count,
    };
  }
}
