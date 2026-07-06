import { IsString, IsNotEmpty, IsEmail, IsEnum, IsArray, ValidateNested, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-()]+$/)
  customerPhone: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsEnum(['delivery', 'pickup'])
  @IsNotEmpty()
  orderType: 'delivery' | 'pickup';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
