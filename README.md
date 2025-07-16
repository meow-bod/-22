# 🐾 Pawdner App - 寵物保姆媒合平台

一個現代化的寵物保姆媒合平台，讓寵物主人能夠輕鬆找到可信賴的寵物保姆，同時讓保姆能夠提供專業的寵物照護服務。

## ✨ 功能特色

### 🏠 寵物主人功能

- 📝 寵物資料管理（新增、編輯、刪除）
- 🔍 智能搜尋和篩選寵物保姆
- 📅 預約和排程管理
- 💬 即時訊息溝通
- ⭐ 評價和回饋系統
- 📱 響應式設計，支援手機和桌面

### 👨‍⚕️ 寵物保姆功能

- 📋 個人檔案和服務設定
- 📍 服務區域設定
- 📊 收入和預約統計
- 🗓️ 可用時間管理
- 📸 服務照片和作品集

### 🛡️ 安全與品質

- 🔐 安全的身份驗證系統
- 🏆 保姆認證和背景檢查
- 💳 安全的付款處理
- 📞 24/7 客戶支援

## 🚀 技術架構

### 前端技術

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **UI Components**: 自訂元件庫
- **Testing**: Jest + React Testing Library

### 後端服務

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **API**: Supabase REST API

### 開發工具

- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Performance**: Lighthouse CI
- **Deployment**: Vercel

## 📦 安裝與設定

### 系統需求

- Node.js 18.0 或更高版本
- npm 或 yarn
- Git

### 1. 複製專案

```bash
git clone <repository-url>
cd pawdner-app
```

### 2. 安裝依賴

```bash
npm install
# 或
yarn install
```

### 3. 環境變數設定

複製 `.env.example` 到 `.env.local` 並填入必要的環境變數：

```bash
cp .env.example .env.local
```

在 `.env.local` 中設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. 資料庫設定

1. 在 Supabase 建立新專案
2. 執行 `supabase/migrations` 中的 SQL 腳本
3. 設定 Row Level Security (RLS) 政策

### 5. 啟動開發伺服器

```bash
npm run dev
# 或
yarn dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 🛠️ 開發指令

### 基本指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產版本
npm start

# 程式碼檢查
npm run lint
npm run lint:fix

# 程式碼格式化
npm run format
npm run format:check

# 類型檢查
npm run type-check
```

### 測試指令

```bash
# 執行所有測試
npm test

# 監視模式執行測試
npm run test:watch

# 產生覆蓋率報告
npm run test:coverage
```

### 品質檢查

```bash
# 執行所有品質檢查
npm run quality

# 執行並自動修復
npm run quality:fix

# 分析建置檔案
npm run analyze

# 清理建置檔案
npm run clean
```

## 📁 專案結構

```
pawdner-app/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── .husky/                 # Git hooks
├── public/                 # 靜態資源
├── src/
│   ├── app/               # Next.js App Router 頁面
│   ├── components/        # 可重用元件
│   │   ├── ui/           # 基礎 UI 元件
│   │   └── __tests__/    # 元件測試
│   ├── hooks/            # 自訂 React Hooks
│   ├── lib/              # 工具函數和配置
│   ├── types/            # TypeScript 類型定義
│   ├── utils/            # 通用工具函數
│   └── styles/           # 全域樣式
├── supabase/             # Supabase 配置和遷移
├── __tests__/            # 測試檔案
├── .env.example          # 環境變數範例
├── .eslintrc.json        # ESLint 配置
├── .prettierrc           # Prettier 配置
├── jest.config.js        # Jest 測試配置
├── jest.setup.js         # Jest 設定檔案
├── lighthouserc.js       # Lighthouse CI 配置
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🧪 測試策略

### 測試類型

- **單元測試**: 測試個別元件和函數
- **整合測試**: 測試元件間的互動
- **端到端測試**: 測試完整的使用者流程

### 測試覆蓋率目標

- 語句覆蓋率: ≥ 80%
- 分支覆蓋率: ≥ 75%
- 函數覆蓋率: ≥ 80%
- 行覆蓋率: ≥ 80%

### 執行測試

```bash
# 執行所有測試
npm test

# 監視模式
npm run test:watch

# 覆蓋率報告
npm run test:coverage
```

## 🚀 部署

### Vercel 部署（推薦）

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 自動部署完成

### 手動部署

```bash
# 建置專案
npm run build

# 啟動生產伺服器
npm start
```

## 🔧 配置說明

### ESLint 配置

- 使用 Next.js 推薦配置
- 整合 TypeScript 支援
- 包含無障礙性檢查
- 自訂規則適合團隊開發

### Prettier 配置

- 統一程式碼格式
- 支援多種檔案類型
- 與 ESLint 整合

### Husky Git Hooks

- **pre-commit**: 執行 lint-staged、類型檢查和測試
- **commit-msg**: 檢查提交訊息格式

## 📊 效能監控

### Lighthouse CI

- 自動效能測試
- Core Web Vitals 監控
- 無障礙性檢查
- SEO 最佳化檢查

### 效能目標

- Performance Score: ≥ 80
- Accessibility Score: ≥ 90
- Best Practices Score: ≥ 80
- SEO Score: ≥ 80

## 🤝 貢獻指南

### 開發流程

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 提交訊息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**類型 (type)**:

- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文件更新
- `style`: 程式碼格式
- `refactor`: 重構
- `test`: 測試
- `chore`: 建構或工具變動

### 程式碼風格

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 嚴格模式
- 撰寫有意義的測試
- 添加適當的註解和文件

## 📝 API 文件

### Supabase API

專案使用 Supabase 作為後端服務，主要 API 端點：

- **Authentication**: `/auth/*`
- **Pets**: `/rest/v1/pets`
- **Sitters**: `/rest/v1/sitters`
- **Bookings**: `/rest/v1/bookings`
- **Messages**: `/rest/v1/messages`

詳細 API 文件請參考 [Supabase 文件](https://supabase.com/docs)。

## 🔒 安全性

### 資料保護

- 所有敏感資料加密存儲
- 實施 Row Level Security (RLS)
- 定期安全性掃描
- HTTPS 強制使用

### 身份驗證

- JWT Token 驗證
- 多因素驗證支援
- 密碼強度要求
- 會話管理

## 📞 支援與聯絡

- **問題回報**: [GitHub Issues](https://github.com/your-repo/issues)
- **功能請求**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **電子郵件**: support@pawdner.app
- **文件**: [專案 Wiki](https://github.com/your-repo/wiki)

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

## 🙏 致謝

感謝所有貢獻者和開源社群的支持！

---

**Made with ❤️ for pet lovers everywhere** 🐕🐱🐦
