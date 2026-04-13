import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    // 讀取 .env 檔，isGlobal: true 表示所有 module 都可以直接注入 ConfigService 使用
    ConfigModule.forRoot({ isGlobal: true }),

    // 非同步設定 TypeORM，因為要等 ConfigModule 讀完 .env 才能拿到連線資訊
    TypeOrmModule.forRootAsync({
      // inject ConfigService 讓 useFactory 可以用 configService.get() 取得環境變數
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        // 自動載入所有用 @Entity() 裝飾器標記的 class
        autoLoadEntities: true,
        // 開發時自動同步 entity 到資料表結構，正式環境要關掉改用 migration
        synchronize: true,
      }),
    }),

    // 全域速率限制：同一 IP 60 秒內最多 60 次請求
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),

    AuthModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全域啟用 ThrottlerGuard，所有 route 自動套用速率限制
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
