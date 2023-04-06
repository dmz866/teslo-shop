import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
	private readonly logger = new Logger('ProductsService');

	constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,
		@InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
		private readonly dataSource: DataSource) {
	}

	async create(createProductDto: CreateProductDto) {
		try {
			const { images = [], ...productDetails } = createProductDto;
			const product = this.productRepository.create({
				images: images.map(i => this.productImageRepository.create({ url: i })),
				...productDetails
			});
			await this.productRepository.save(product);

			return { ...product, images };
		}
		catch (error) {
			this.logger.error(error);
			throw new InternalServerErrorException(error);
		}
	}

	async findAll(paginationDto: PaginationDto) {
		const { limit = 10, offset = 0 } = paginationDto;
		const products = await this.productRepository.find({ take: limit, skip: offset, relations: { images: true } });

		return products.map(p => ({ ...p, images: p.images.map(i => i.url) }));
	}

	async findOne(term: string) {
		try {
			let product: Product;

			if (isUUID(term)) {
				product = await this.productRepository.findOneBy({ id: term });
			}

			const queryBuilder = this.productRepository.createQueryBuilder('product');
			product = await queryBuilder
				.where('title =:title or slug =:slug', { title: term, slug: term })
				.leftJoinAndSelect('product.images', 'productImages')
				.getOne();

			return { ...product, images: product.images.map(i => i.url) };
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
		const queryRunner = this.dataSource.createQueryRunner();

		try {
			const { images, ...toUpdate } = updateProductDto;
			const product = await this.productRepository.preload({ id, ...toUpdate });

			if (!product) throw new NotFoundException(`${id} not found`);

			await queryRunner.connect();
			await queryRunner.startTransaction();

			if (images) {
				await queryRunner.manager.delete(ProductImage, { product: { id } });
				product.images = images.map(i => this.productImageRepository.create({ url: i }));
			}
			else {
				product.images = await this.productImageRepository.findBy({ product: { id } });
			}

			await queryRunner.manager.save(product);
			await queryRunner.commitTransaction();
			await queryRunner.release();
			//await this.productRepository.save(product);

			return product;
		}
		catch (error) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();

			throw new InternalServerErrorException(error);
		}
	}

	async remove(id: string) {
		return await this.productRepository.delete({ id });
	}
}
