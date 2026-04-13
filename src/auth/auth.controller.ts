import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// auth 端點統一限制：同一 IP 60 秒內最多 5 次，防暴力破解
@Throttle({ default: { ttl: 60000, limit: 5 } })
@Controller('auth')
export class AuthController {
  // 依賴注入：NestJS 會自動建立 AuthService 實例並傳入
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // @Body() 從 request body 取值，會經過 ValidationPipe 驗證 RegisterDto 的規則
    return this.authService.register(registerDto);
  }

  @Post('login') 
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @UseGuards(JwtAuthGuard) 表示這個 route 需要帶有效的 Bearer Token 才能存取
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    // @Request() 取得整個 request 物件，req.user 是 JwtStrategy.validate() 的回傳值
    @Request() req: { user: { id: string } },
    @Body() body: RefreshDto,
  ) {
    await this.authService.logout(req.user.id, body.refresh_token);
    return { message: '登出成功' };
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refresh_token);
  }

  // TODO: 忘記密碼 — 暫不實作
  // POST /api/v1/auth/forget
  // 預計流程：接收 email → 寄重設密碼信件 → 使用者點連結重設密碼
}
