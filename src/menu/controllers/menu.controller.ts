import { Controller, Get, Patch, Param, Body, UseInterceptors, Query } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer/class-serializer.interceptor';
import { MenuService } from '../services/menu.service';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuResponseDto } from '../dto/menu-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('api/v1/menu')
@UseInterceptors(ClassSerializerInterceptor)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async findAll(
    @Query('available') available?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponseDto<MenuResponseDto>> {
    const categories = await this.menuService.findAllGrouped({
      available: available === 'true' ? true : available === 'false' ? false : undefined,
      categoryId: category,
      search,
    });
    const response = {
      categories: categories.map(cat => ({
        ...cat,
        menuItems: cat.menuItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          stockCount: item.stockCount,
          imageUrl: item.imageUrl || undefined,
          isAvailable: item.isAvailable,
        }))
      }))
    };
    return ApiResponseDto.success(response);
  }

  @Get('items/:id')
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const menuItem = await this.menuService.findOne(id);
    const response = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      stockCount: menuItem.stockCount,
      imageUrl: menuItem.imageUrl || undefined,
      isAvailable: menuItem.isAvailable,
      categoryId: menuItem.categoryId,
      categoryName: menuItem.category?.name || 'Unknown'
    };
    return ApiResponseDto.success(response);
  }

  @Patch('items/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<ApiResponseDto<any>> {
    const menuItem = await this.menuService.update(id, updateMenuItemDto);
    const response = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      stockCount: menuItem.stockCount,
      imageUrl: menuItem.imageUrl || undefined,
      isAvailable: menuItem.isAvailable,
      categoryId: menuItem.categoryId,
      categoryName: menuItem.category?.name || 'Unknown'
    };
    return ApiResponseDto.success(response);
  }
}
