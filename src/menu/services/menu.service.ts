import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuCategory } from '../entities/menu-category.entity';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepository: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private readonly categoryRepository: Repository<MenuCategory>,
  ) {}

  async findAllGrouped(filters?: {
    available?: boolean;
    categoryId?: string;
    search?: string;
  }): Promise<any[]> {
    const whereConditions: any = {};

    if (filters?.available !== undefined) {
      whereConditions.isAvailable = filters.available;
    }

    const categories = await this.categoryRepository.find({
      order: { displayOrder: 'ASC' },
    });

    let menuItems = await this.menuRepository.find({
      where: whereConditions,
      relations: ['category'],
      order: { name: 'ASC' },
    });

    // Search filter (name or description)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      menuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    let filteredCategories = categories.map(category => ({
      ...category,
      menuItems: menuItems.filter(item => item.categoryId === category.id),
    }));

    // Filter by category if specified
    if (filters?.categoryId) {
      filteredCategories = filteredCategories.filter(cat => cat.id === filters.categoryId);
    }

    // Remove empty categories
    filteredCategories = filteredCategories.filter(cat => cat.menuItems.length > 0);

    return filteredCategories;
  }

  async findAll(): Promise<MenuItem[]> {
    return await this.menuRepository.find({
      where: { isAvailable: true },
      relations: ['category'],
      order: { category: { displayOrder: 'ASC' }, name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!menuItem) {
      throw new NotFoundException(`Menu item #${id} not found`);
    }
    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findOne(id);
    this.menuRepository.merge(menuItem, updateMenuItemDto);
    return await this.menuRepository.save(menuItem);
  }
}
