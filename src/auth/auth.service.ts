import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Member } from '../members/entities/member.entity';
import { Token } from './entities/token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository() 注入 TypeORM 的 Repository
    // Repository 提供 CRUD 方法（find, save, delete 等）來操作資料表
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    // NestJS 內建的 JWT 服務，用來簽發和驗證 token
    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 檢查 email 是否已被註冊
    const existing = await this.memberRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new ConflictException('Email 已被註冊');
    }

    // bcrypt.hash() 將明文密碼雜湊，10 是 salt rounds（加鹽次數，越高越安全但越慢）
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // repository.create() 只是建立 entity 實例（還沒寫入資料庫）
    const member = this.memberRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
    });

    // repository.save() 才會真正寫入資料庫
    await this.memberRepository.save(member);

    return { id: member.id, name: member.name, email: member.email };
  }

  async login(loginDto: LoginDto) {
    const member = await this.memberRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!member) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // bcrypt.compare() 比對明文密碼和雜湊值是否匹配
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      member.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // 更新最後登入時間
    member.last_login_at = new Date();
    await this.memberRepository.save(member);

    // 產生 access token 和 refresh token
    const tokens = await this.generateTokens(member);

    return {
      ...tokens,
      name: member.name,
      email: member.email,
      id: member.id,
    };
  }

  async logout(userId: string, refreshToken: string) {
    // 刪除該 refresh token，使其失效
    await this.tokenRepository.delete({
      user_id: userId,
      token: refreshToken,
    });
  }

  async refresh(refreshToken: string) {
    // 從資料庫找到這個 refresh token
    const tokenRecord = await this.tokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token 無效或已過期');
    }

    const member = await this.memberRepository.findOne({
      where: { id: tokenRecord.user_id },
    });
    if (!member) {
      throw new UnauthorizedException('使用者不存在');
    }

    // 刪除舊的 refresh token，產生新的一組（rotation 機制，提高安全性）
    await this.tokenRepository.delete({ id: tokenRecord.id });
    const tokens = await this.generateTokens(member);

    return tokens;
  }

  // 產生 access token（短效）和 refresh token（長效）
  private async generateTokens(member: Member) {
    // JWT payload：sub 是 JWT 標準欄位，代表 subject（使用者 ID）
    const payload = { sub: member.id, email: member.email };

    const accessToken = this.jwtService.sign(payload);

    // refresh token 用另一個較長的過期時間
    const refreshExpiresInSeconds = 7 * 24 * 60 * 60; // 7 天（秒）
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiresInSeconds,
    });

    // 將 refresh token 存到資料庫，用於後續驗證和撤銷
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenEntity = this.tokenRepository.create({
      token: refreshToken,
      user_id: member.id,
      expires_at: expiresAt,
    });
    await this.tokenRepository.save(tokenEntity);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
