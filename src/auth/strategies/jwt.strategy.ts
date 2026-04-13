import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Passport 策略定義「如何驗證 token」
// PassportStrategy(Strategy) 是 NestJS 對 passport-jwt 的包裝
// 當 request 帶有 Bearer Token 時，Passport 會：
// 1. 從 header 取出 token
// 2. 用 JWT_SECRET 驗證簽名
// 3. 如果合法，呼叫 validate() 把解碼後的 payload 放到 request.user
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // 從 Authorization header 的 Bearer token 取得 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不允許過期的 token
      ignoreExpiration: false,
      // 用來驗證 token 簽名的密鑰，必須跟簽發時用的一樣
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // validate() 在 token 驗證通過後被呼叫
  // 參數 payload 是 JWT 解碼後的內容（就是簽發時放進去的資料）
  // 回傳值會被放到 request.user，後續 controller 可以用 @Request() 取得
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
