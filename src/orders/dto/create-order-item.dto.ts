import { IsInt, IsPositive, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  menuItemId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
