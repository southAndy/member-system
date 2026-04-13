import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO（Data Transfer Object）定義 request body 的形狀和驗證規則
// class-validator 的裝飾器會在 ValidationPipe 階段自動檢查，不符合規則會回傳 400 錯誤
export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
