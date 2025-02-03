import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResourceClassifyService } from './resource-classify.service';
import { CreateResourceClassifyDto } from './dto/create-resource-classify.dto';
import { LoginGuard } from 'common/guard/login.guard';

@UseGuards(LoginGuard)
@Controller('resource-classify')
export class ResourceClassifyController {
  constructor(
    private readonly resourceClassifyService: ResourceClassifyService,
  ) {}

  @Post()
  create(@Body() createResourceClassifyDto: CreateResourceClassifyDto) {
    return this.resourceClassifyService.create(createResourceClassifyDto);
  }

  @Get('/all')
  findAll() {
    return this.resourceClassifyService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceClassifyService.remove(+id);
  }
}
