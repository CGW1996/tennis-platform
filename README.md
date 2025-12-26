# 網球平台前端

基於 Next.js 14 和 TypeScript 的現代化網球平台前端應用。

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **表單處理**: React Hook Form + Zod
- **HTTP 客戶端**: Axios + React Query
- **認證**: NextAuth.js
- **地圖**: React Leaflet
- **UI 組件**: Headless UI + Heroicons
- **動畫**: Framer Motion

## 專案結構

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router 頁面
│   ├── components/             # 可重用組件
│   │   ├── ui/                # 基礎 UI 組件
│   │   ├── forms/             # 表單組件
│   │   ├── layout/            # 佈局組件
│   │   └── features/          # 功能特定組件
│   ├── hooks/                 # 自定義 React Hooks
│   ├── lib/                   # 工具庫和配置
│   ├── store/                 # 狀態管理
│   ├── types/                 # TypeScript 類型定義
│   ├── utils/                 # 工具函數
│   └── styles/                # 全局樣式
├── public/                    # 靜態資源
├── docs/                      # 文檔
├── tests/                     # 測試文件
├── next.config.js             # Next.js 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
└── package.json
```

## 開發指南

### 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 啟動開發服務器：
```bash
npm run dev
```

3. 打開瀏覽器訪問 http://localhost:3000

### 可用腳本

- `npm run dev` - 啟動開發服務器
- `npm run build` - 構建生產版本
- `npm run start` - 啟動生產服務器
- `npm run lint` - 運行 ESLint 檢查
- `npm run format` - 格式化代碼
- `npm run type-check` - TypeScript 類型檢查
- `npm run test` - 運行測試
- `npm run test:watch` - 監視模式運行測試
- `npm run test:coverage` - 運行測試並生成覆蓋率報告

### 環境變量

創建 `.env.local` 文件並設置以下變量：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 代碼規範

- 使用 TypeScript 進行類型安全開發
- 遵循 ESLint 和 Prettier 配置
- 使用 Tailwind CSS 進行樣式開發
- 組件使用 PascalCase 命名
- 文件和目錄使用 kebab-case 命名
- 為所有公共組件添加 JSDoc 註釋

### 組件開發指南

1. **基礎 UI 組件** (`src/components/ui/`)
   - 可重用的基礎組件
   - 不包含業務邏輯
   - 支持主題和變體

2. **功能組件** (`src/components/features/`)
   - 特定功能的組件
   - 包含業務邏輯
   - 可組合多個基礎組件

3. **頁面組件** (`src/app/`)
   - Next.js App Router 頁面
   - 處理路由和數據獲取
   - 組合功能組件

### 狀態管理

使用 Zustand 進行狀態管理：

```typescript
// src/store/auth.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### API 集成

使用 Axios 和 React Query 進行 API 調用：

```typescript
// src/hooks/use-users.ts
import { useQuery } from 'react-query';
import { api } from '@/lib/api';

export const useUsers = () => {
  return useQuery('users', () => api.get('/users'));
};
```

### 測試

- 使用 Jest 和 React Testing Library
- 為組件編寫單元測試
- 為 Hooks 編寫測試
- 為關鍵功能編寫集成測試