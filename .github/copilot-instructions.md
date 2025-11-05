# 轻书架 (Light Novel Shelf) - AI Coding Instructions

## Project Overview

A multi-platform online novel reading application built with **Quasar (Vue 3 + TypeScript)**, targeting web (PWA), mobile (Capacitor), and desktop (Electron). Product name: "轻书架".

## Architecture

### Communication Layer

- **SignalR WebSocket** (`src/services/internal/request/signalr/`) is the primary API protocol
  - Uses MessagePack binary protocol with gzip compression
  - Auto-reconnect with retry policy (15s intervals)
  - Request queue with rate limiting (`rateLimitQueue`)
  - **Cache-first fallback**: Returns cached data when disconnected, documented in `docs/缓存架构.md`
  - Token refresh via `accessTokenFactory` (session token + long-term token pattern)
- Dual request methods: `requestWithSignalr` (primary) and `requestWithFetch` (fallback)
- All API responses follow `{ Success, Response, Status, Msg }` structure

### State Management

- **Pinia stores** with strict naming convention (see `src/stores/app.ts` header):
  - Global stores: `app.*` (e.g., `app.user`, `app.setting`)
  - Page-scoped stores: `page.*` (e.g., `page.book`)
- Settings persisted to IndexedDB via `localforage` (`src/utils/storage/db/`)
- Dark mode managed by `Dark` utility, not stored on server

### 路由与认证

- Vue Router 启用 history 模式，并通过 `meta.requiresAuth` 实现路由级认证
- 未授权的请求会触发 `unAuthenticationNotify`（发布/订阅模式）
- 路由采用延迟加载，并使用动态导入（`import('../pages/...')`）

## Development Patterns

### Component Conventions

- **Auto-imports** enabled for Vue/Router/Pinia APIs (via `unplugin-auto-import`)
- Icons: Use `mdi-js` (Material Design Icons JS), import from `src/boot/quasar/icon.ts`
- Quasar components/directives imported automatically
- Custom directives: Use `createDirective<Element, Value>` helper (e.g., `longPress.ts`)

### State Patterns

- **Controlled components**: Use `useMergeState` for props + internal state management
- **Init requests**: Use `useInitRequest` composable for mount/activate/deactivate lifecycle
- **Loading states**: Wrap async functions with `useLoadingFn` to expose `.loading` ref

### Service Layer Structure

- Services organized by domain: `book/`, `chapter/`, `user/`, `forum/`, etc.
- Inspector pattern for SignalR debugging (enabled with `process.env.VUE_TRACE_SERVER`)
- Error handling: Throw `ServerError(message, status)` for API failures

### Import Ordering (ESLint enforced)

```typescript
// 1. External packages
import { ref } from 'vue'
// 2. Internal utils/stores/components/composition
import { Dark } from 'src/utils/dark'
import { useAppStore } from 'stores/app'
// 3. Types (via type imports)
import type { Ref } from 'vue'
// 4. CSS (last)
import './styles.css'
```

Use `@typescript-eslint/consistent-type-imports` - prefer `import type` for types.

## Build & Development

## 构建与开发

### 命令

- `npm run dev` - 启动带有 HMR 的开发服务器
- `npm run build` - 构建 Web 应用
- `npm run build -m pwa` - 构建 PWA（使用 Workbox Service Worker，缓存限制为 3MB）
- `npm run build -m capacitor -T android|ios` - 构建移动应用
- `npm run lint:fix` - 自动修复代码检查问题（例如导入顺序等）

### 配置

- **quasar.config.ts**：启动文件顺序：`app → quasar → v-viewer → dayjs → md-editor`
- **构建目标**：ES2022，现代浏览器（Chrome/Firefox 115+，Safari 14+）
- **代码分割**：根据 `md-editor-v3/codemirror` 与其他 node_modules 进行代码块分割
- **环境**：从 Git 注入 `VUE_COMMIT_SHA`（7 个字符）

## 关键文件和模式

### 多平台支持

- `src-pwa/`：PWA 服务工作线程 + 清单文件
- `src-capacitor/`：移动应用配置
- `src-electron/`：桌面应用入口点
- 共享代码库，包含平台专属构建

### 组合工具

- `useResizeObserver`、`useMasonry`、`useMedia`：UI 工具
- `useTimeoutFn`、`useIsActivated`：生命周期辅助函数
- `useToNowRef`：响应式时间格式化（使用 dayjs）

## 常见任务

### 添加新的 API 端点

1. 在 `src/services/<domain>/types.ts` 中定义类型
2. 使用 `requestWithSignalr` 将方法添加到 `src/services/<domain>/index.ts`

### 创建新页面

1. 使用 `meta.requiresAuth` 将路由添加到 `src/router/routes.ts`
2. 在 `src/pages/<feature>/` 中创建页面
3. 如果需要加载数据：使用带有路由激活感知的 `useInitRequest`
4. 如果需要本地状态：在 `src/pages/<feature>/store.ts` 中创建名为 `page.<feature>` 的 store

### Debugging

- 先运行项目，查看运行端口, 然后启动浏览器
- 没有登录的，要求用户手动进行登录
- 随后查看浏览器控制台，寻找 Api 调用日志

### 其他项目指南

- 项目已有时间格式化工具 `toNow(parseTime(timeString))` 在 `time.ts`，不要重复实现时间格式化逻辑。
