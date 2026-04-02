import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 所有 route 自動加上 /api/v1 前綴，例如 controller 裡的 @Post('auth/login') 會變成 /api/v1/auth/login
  app.setGlobalPrefix('api/v1');

  // 自動驗證 request body，搭配 DTO 上的 class-validator 裝飾器使用
  // whitelist: true 會自動過濾掉 DTO 沒定義的欄位，避免前端傳多餘資料進來
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
