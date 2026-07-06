import { Expose } from 'class-transformer';

export class MenuItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: string;

  @Expose()
  stockCount: number;

  @Expose()
  imageUrl?: string;

  @Expose()
  isAvailable: boolean;
}

export class MenuCategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  displayOrder: number;

  @Expose()
  menuItems: MenuItemResponseDto[];
}

export class MenuResponseDto {
  @Expose()
  categories: MenuCategoryResponseDto[];
}
