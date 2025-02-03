import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { LoginGuard } from 'common/guard/login.guard';

@UseGuards(LoginGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  create(@Body() createResourceDto: CreateResourceDto, @Req() req: Request) {
    return this.resourceService.create(createResourceDto, req);
  }

  @Get('/all')
  findAll(@Req() req: Request) {
    return this.resourceService.findAll(req);
  }

  @Get()
  findOne(@Req() req: Request) {
    return this.resourceService.findOne(req);
  }
}
