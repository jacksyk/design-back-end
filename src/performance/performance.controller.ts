import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  create(@Body() createPerformanceDto: CreatePerformanceDto) {
    return this.performanceService.create(createPerformanceDto);
  }

  @Get()
  findAll() {
    return this.performanceService.findAll();
  }
}
