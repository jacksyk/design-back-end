import { Controller, Post, UploadedFile } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { host } from '../../constants';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    // 来提取file字段
    FileInterceptor('file', {
      dest: 'public', // 目标目录存储
      storage: diskStorage({
        // 配置文件上传后的文件夹路径
        destination: `./public`,
        filename: (req, file, cb) => {
          // 在此处自定义保存后的文件名称
          return cb(null, file.originalname);
        },
      }),
    }),
  )
  create(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    const { originalname } = file;
    return {
      url: `${host}/static/${originalname}`,
    };
  }
}
