import { IsString, IsNotEmpty, IsBoolean, IsOptional, Min, MaxLength, IsDecimal, IsNumber } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsDecimal()
  price: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockCount?: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
