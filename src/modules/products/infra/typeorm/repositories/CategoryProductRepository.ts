import { getRepository, Repository, Like } from 'typeorm';
import CategoryProduct from '@modules/products/infra/typeorm/entities/CategoryProduct';
import ICreateCategoryProductDTO from '@modules/products/Dtos/ICreateCategoryProductDTO';
import ICategoryProductRepository from '@modules/products/repositories/ICategoryProductRepository';
import removeAccents from '@shared/utils/removeAccents';

class CategoryProductRepository implements ICategoryProductRepository {
  private ormRepository: Repository<CategoryProduct>;

  constructor() {
    this.ormRepository = getRepository(CategoryProduct);
  }

  public async create(
    data: ICreateCategoryProductDTO[],
  ): Promise<CategoryProduct[]> {
    const categories = this.ormRepository.create(data);

    await this.ormRepository.save(categories);

    return categories;
  }

  public async searchInCategory(search: string): Promise<CategoryProduct[]> {
    const categories = await this.ormRepository.find({
      where: {
        label_name: Like(`%${removeAccents(search).toLowerCase().trim()}%`),
      },
      take: 15,
    });

    return categories;
  }
}

export default CategoryProductRepository;
