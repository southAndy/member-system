# Member System

一套以 NestJS 11 + TypeORM + PostgreSQL 實作的會員系統後端，涵蓋註冊驗證、JWT + Refresh Token 認證、密碼雜湊、速率限制、Docker 部署等完整流程。

> 本專案是我（前端轉後端工程師）的後端學習作品，目標是**走完一輪「資料表設計 → API 開發 → 安全強化 → 容器化部署」的完整流程**，而非堆疊功能。

## ✨ 主要功能

- 🔐 **完整認證流程**：註冊、登入、登出、token 換新、email 驗證
- 🛡️ **JWT + Refresh Token**：access token 短命、refresh token 寫入資料庫可撤銷
- 🔑 **bcrypt 密碼雜湊**：明文密碼絕不入庫
- 📧 **Email 驗證信**：SendGrid 寄送一次性驗證連結
- 🚦 **Rate Limiting**：`@nestjs/throttler` 限制 auth 端點 5 次/分鐘，防暴力破解
- 🪖 **安全性 headers**：Helmet + CORS 白名單
- ✅ **DTO 驗證**：全域 ValidationPipe + class-validator，自動過濾未宣告欄位
- 🐳 **Docker 化部署**：docker-compose 一鍵啟動 app + PostgreSQL

## 🧱 技術選型與理由

| 技術 | 選擇理由 |
|---|---|
| **NestJS** | 模組化、依賴注入、裝飾器導向，適合需要清晰結構的應用 |
| **TypeORM** | 與 NestJS 整合度高，TypeScript 友善，Migration 機制完整 |
| **PostgreSQL** | 開源、約束條件齊全（unique / partial index / CHECK）、未來擴展性佳 |
| **JWT + Refresh Token** | 短命 access 降低洩漏風險，refresh 入庫可即時撤銷 |
| **Passport** | 認證策略可插拔，未來新增 OAuth 直接擴充 |
| **SendGrid** | 信件送達率穩定、免費額度足夠開發測試 |
| **Helmet** | 一行加上多個安全性 HTTP headers，CP 值最高的安全強化 |

## 🗺️ 架構

```
┌─────────────────────────────────────────────────────┐
│                  Client (Browser/App)                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│   Nginx (Reverse Proxy + SSL)                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│   NestJS App (Docker)                               │
│   ┌─────────────────────────────────────────────┐   │
│   │  Helmet → CORS → ValidationPipe → Throttler │   │
│   └─────────────────────────────────────────────┘   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │   Auth   │  │ Members  │  │  Email   │         │
│   │  Module  │  │  Module  │  │  Module  │         │
│   └──────────┘  └──────────┘  └──────────┘         │
└──────────────────────┬──────────────────────────────┘
                       │ TypeORM
                       ▼
┌─────────────────────────────────────────────────────┐
│   PostgreSQL (Docker Volume)                        │
│   - member (使用者基本資料 + 驗證狀態)               │
│   - token  (refresh tokens, 可撤銷)                 │
└─────────────────────────────────────────────────────┘
```

## 📦 資料表設計

### `member`
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid (PK) | 主鍵，自動產生 |
| email | varchar (unique) | 信箱，唯一 |
| name | varchar | 姓名 |
| password | varchar | bcrypt hash |
| is_verified | boolean | 是否完成 email 驗證 |
| verification_token | varchar (nullable) | 一次性驗證 token |
| last_login_at | timestamp (nullable) | 最後登入時間 |
| created_at / updated_at | timestamp | 自動維護 |

### `token`（refresh token 撤銷機制）
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid (PK) | |
| token | varchar | refresh token 值 |
| user_id | uuid (FK → member, ON DELETE CASCADE) | |
| expires_at | timestamp | 過期時間 |
| created_at | timestamp | |

> 為什麼 refresh token 要存進 DB 而不是只用 JWT 自驗？  
> **為了支援登出與裝置撤銷**。純 JWT 無法在過期前主動失效，refresh token 入庫後可即時刪除實現「登出」與「踢出某裝置」。

## 🔌 API 端點

> 所有端點皆有 `/api/v1` 前綴。

| Method | Path | 認證 | 說明 |
|---|---|---|---|
| POST | `/auth/register` | ❌ | 註冊並寄送驗證信 |
| POST | `/auth/login` | ❌ | 登入，回傳 access + refresh token |
| POST | `/auth/logout` | ✅ Bearer | 登出，撤銷指定 refresh token |
| POST | `/auth/refresh` | ❌ (帶 refresh) | 用 refresh token 換新 access token |
| GET | `/auth/verify?token=` | ❌ | 點擊驗證信連結驗證 email |
| GET | `/member/:id` | ✅ Bearer | 取得會員資料 |
| PATCH | `/member/:id` | ✅ Bearer | 更新會員資料 |
| DELETE | `/member/:id` | ✅ Bearer | 刪除會員 |

詳細 request / response 結構見 [`docs/api.md`](./docs/api.md)。

## 🚀 快速開始

### 需求

- Node.js ≥ 20
- Docker / Docker Compose
- SendGrid API Key（寄信用，可暫時 mock）

### 1. Clone + 安裝

```bash
git clone <this-repo>
cd member-system
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
# 編輯 .env，填入 DB / JWT / SendGrid 設定
```

### 3. 用 Docker Compose 啟動

```bash
docker compose up -d
# app 跑在 http://localhost:3000
```

### 4. 本地開發（不走 Docker）

```bash
npm run start:dev
```

## 🧪 測試

```bash
npm test              # 單元測試
npm run test:e2e      # E2E 測試
npm run test:cov      # 覆蓋率
```

## 📁 目錄結構

```
src/
├── main.ts                     # bootstrap：global prefix、Helmet、CORS、ValidationPipe
├── app.module.ts
├── auth/
│   ├── auth.controller.ts      # /auth 路由（register / login / logout / refresh / verify）
│   ├── auth.service.ts         # 認證核心邏輯
│   ├── dto/                    # register / login / refresh DTO（class-validator）
│   ├── strategies/             # JwtStrategy（passport-jwt）
│   ├── guards/                 # JwtAuthGuard
│   └── entities/token.entity.ts
├── members/
│   ├── members.controller.ts   # /member 路由（受 JWT 保護）
│   ├── members.service.ts
│   ├── dto/update-member.dto.ts
│   └── entities/member.entity.ts
├── email/
│   └── email.service.ts        # SendGrid 寄信封裝
└── common/
    ├── filters/http-exception.filter.ts    # 全域錯誤處理
    ├── interceptors/response.interceptor.ts # 統一回應格式
    └── middleware/logging.middleware.ts    # 請求日誌
```

## 🎯 設計亮點 / 學到的東西

### 1. 為什麼 Refresh Token 要入庫
最初只想用 JWT 自驗減少 DB 查詢，但這樣登出無法即時失效。改成 refresh token 入庫後，登出 = 刪除該筆 token，下次 refresh 就會被拒絕。**安全性 > 效能**，這是入庫的取捨理由。

### 2. ValidationPipe 的 whitelist 是最划算的安全強化
打開 `whitelist: true` 後，前端傳了 DTO 沒宣告的欄位會自動被剝掉。這擋掉一大類「mass assignment」漏洞（例如使用者偷塞 `is_verified: true`）。

### 3. Rate Limiting 放在 controller 層級
`@Throttle()` 裝飾器套在 `AuthController` 整個 class，而不是逐個 method 設定，避免之後新增 endpoint 漏掉防護。

### 4. Email 驗證 token 的設計
驗證 token 存在 `member.verification_token`，驗證成功後**立即清空**。這讓連結變成一次性，避免被重複使用或洩漏後濫用。

## 🛠️ 待加強 / 後續規劃

- [ ] 忘記密碼流程（`POST /auth/forget`）
- [ ] OAuth 第三方登入（Google / GitHub）
- [ ] 雙裝置登入時的 sessions 表（多 refresh token / 裝置資訊）
- [ ] CI/CD（GitHub Actions 自動部署）
- [ ] 整合測試覆蓋率提升
- [ ] OpenAPI / Swagger 文件自動生成

## 📝 相關文件

- [`docs/api.md`](./docs/api.md) — API 詳細規格
- [`docs/設計一套會員系統 API.md`](./docs/設計一套會員系統%20API.md) — 設計過程紀錄

## 🧑‍💻 作者

- Andy Tseng
- Blog: <https://andywalking.tw/>
