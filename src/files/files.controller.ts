import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) { }

	@Post('product')
	@UseInterceptors(FileInterceptor('file',
		{
			fileFilter, limits: { fileSize: 1000 },
			storage: diskStorage({ destination: './static/products', filename: fileNamer })
		}))
	uploadProductFile(@UploadedFile() file: Express.Multer.File) {
		return file.filename;
	}

	@Get('product/:imageName')
	getProductFile(@Res() res: Response, @Param('imageName') imageName: string) {
		const path = this.filesService.getProductFile(imageName);

		return res.sendFile(path);
	}
}
