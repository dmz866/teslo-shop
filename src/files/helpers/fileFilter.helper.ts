import { Request } from "express";

export const fileFilter = (request: Request, file: Express.Multer.File, callback: Function) => {
	if (!file) return callback(new Error('file is empty'), false);

	const fileExt = file.mimetype.split('/')[1];
	const validExt = ['jpeg', 'jpg', 'png'];

	if (!validExt.includes(fileExt)) return callback(new Error('file is not a valid image'), false);

	return callback(null, true);
}