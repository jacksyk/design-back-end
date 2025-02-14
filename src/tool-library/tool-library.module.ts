import { Module } from '@nestjs/common';
import { ToolLibraryService } from './tool-library.service';
import { ToolLibraryController } from './tool-library.controller';

@Module({
  controllers: [ToolLibraryController],
  providers: [ToolLibraryService],
})
export class ToolLibraryModule {}
