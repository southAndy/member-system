import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard 決定「這個 request 能不能進到 controller」
// AuthGuard('jwt') 會觸發上面的 JwtStrategy 進行驗證
// 在 controller 上加 @UseGuards(JwtAuthGuard) 就能保護該 route
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
