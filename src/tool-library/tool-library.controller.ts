import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ToolLibraryService } from './tool-library.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateToolDto } from './dto/create-tool.dto';

@Controller('tool-library')
export class ToolLibraryController {
  constructor(private readonly toolLibraryService: ToolLibraryService) {}

  // 创建tag标签
  @Post('/tag')
  createTag(@Body() createToolLibraryDto: CreateTagDto) {
    return this.toolLibraryService.createTag(createToolLibraryDto);
  }

  @Get('/tag/all')
  findAllTag() {
    return this.toolLibraryService.findAllTag();
  }

  @Delete('/tag/:id')
  deleteTag(@Param('id') id: string) {
    return this.toolLibraryService.deleteTag(+id);
  }

  // 创建工具箱
  @Post('/tool')
  createTool(@Body() createToolDto: CreateToolDto) {
    return this.toolLibraryService.createTool(createToolDto);
  }

  // 找到所有工具
  @Get('/tool/all')
  findAllTool() {
    return this.toolLibraryService.findAllTool();
  }

  // 删除工具
  @Delete('/tool/:id')
  deleteTool(@Param('id') id: string) {
    return this.toolLibraryService.deleteTool(+id);
  }
}
