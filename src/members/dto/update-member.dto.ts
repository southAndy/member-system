import { IsOptional, IsString, IsEmail } from 'class-validator';

// Partial update：所有欄位都是 @IsOptional()，前端只需要傳要改的欄位
export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
