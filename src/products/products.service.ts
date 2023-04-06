import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
	private readonly logger = new Logger('ProductsService');

	constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,
		@InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>) {
	}

	async create(createProductDto: CreateProductDto) {
		try {
			const { images = [], ...productDetails } = createProductDto;
			const product = this.productRepository.create({
				images: images.map(i => this.productImageRepository.create({ url: i })),
				...productDetails
			});
			await this.productRepository.save(product);

			return product;
		} catch (error) {
			this.logger.error(error);
			throw new InternalServerErrorException(error);
		}
	}

	async findAll(paginationDto: PaginationDto) {
		const { limit = 10, offset = 0 } = paginationDto;

		return await this.productRepository.find({ take: limit, skip: offset });
	}

	async findOne(term: string) {
		try {
			let product: Product;

			if (isUUID(term)) {
				product = await this.productRepository.findOneBy({ id: term });
			}

			const queryBuilder = this.productRepository.createQueryBuilder();
			product = await queryBuilder
				.where('title =:title or slug =:slug', { title: term, slug: term })
				.getOne();

			return product;
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
		try {
			const product = await this.productRepository.preload({
				id,
				...updateProductDto,
				images: []
			});

			if (!product) throw new NotFoundException(`${id} not found`);

			return await this.productRepository.save(product);
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	async remove(id: string) {
		return await this.productRepository.delete({ id });
	}
}
