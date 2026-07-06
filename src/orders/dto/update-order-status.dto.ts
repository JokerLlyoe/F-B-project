import { IsEnum, IsNotEmpty } from 'class-validator';
import { ORDER_STATUSES } from '../../common/constants/status.constants';

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUSES)
  @IsNotEmpty()
  status: typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
}
