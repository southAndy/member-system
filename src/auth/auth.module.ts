import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Token } from './entities/token.entity';
import { Member } from '../members/entities/member.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature() 註冊這個 module 會用到的 entity
    // 註冊後才能在 service 裡用 @InjectRepository() 注入對應的 Repository
    TypeOrmModule.forFeature([Token, Member]),

    PassportModule,

    // 非同步設定 JWT，從 .env 讀取 secret 和過期時間
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 15 * 60, // 15 分鐘（秒）
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // providers 裡的 service 和 strategy 會被 NestJS 的 DI 容器管理
  providers: [AuthService, JwtStrategy],
  // exports 讓其他 module 可以使用這裡的 JwtAuthGuard（透過 JwtStrategy）
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
