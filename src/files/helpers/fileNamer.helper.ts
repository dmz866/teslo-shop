import { Request } from "express";
import { v4 as uuid } from "uuid";

export const fileNamer = (request: Request, file: Express.Multer.File, callback: Function) => {
	if (!file) return callback(new Error('file is empty'), false);

	const fileExt = file.mimetype.split('/')[1];
	const fileName = `${uuid()}.${fileExt}`;

	return callback(null, fileName);
}