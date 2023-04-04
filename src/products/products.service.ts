import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
	private readonly logger = new Logger('ProductsService');

	constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {
	}

	async create(createProductDto: CreateProductDto) {
		try {
			const product = this.productRepository.create(createProductDto);
			await this.productRepository.save(product);
			return product;
		} catch (error) {
			this.logger.error(error);
			throw new InternalServerErrorException(error);
		}
	}

	async findAll() {
		return await this.productRepository.find();
	}

	async findOne(id: string) {
		return await this.productRepository.findOneBy({ id });
	}

	update(id: string, updateProductDto: UpdateProductDto) {
		return `This action updates a #${id} product`;
	}

	async remove(id: string) {
		return await this.productRepository.delete({ id });
	}
}
