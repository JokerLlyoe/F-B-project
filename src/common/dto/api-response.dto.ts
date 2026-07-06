export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;

  static success<T>(data: T): ApiResponseDto<T> {
    return { success: true, data };
  }

  static error(message: string, error?: string): ApiResponseDto {
    return { success: false, message, error };
  }
}
