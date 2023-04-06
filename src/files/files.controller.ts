import { Body, Controller, Post } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) { }

	@Post()
	uploadFile(@Body() createFileDto: CreateFileDto) {
		return this.filesService.uploadFile(createFileDto);
	}

}
