import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import {MulterModule} from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { extname } from 'path';
import {CustomException} from "../exceptions/CustomException";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Validate file type
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new CustomException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024, // 1MB file size limit
      },
    }),
  ],
  controllers: [UploadController]
})
export class UploadModule {}
