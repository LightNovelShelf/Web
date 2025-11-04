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

### Routing & Auth

- Vue Router history mode with route-level auth via `meta.requiresAuth`
- Unauthorized requests trigger `unAuthenticationNotify` (pub-sub pattern)
- Routes lazy-loaded with dynamic imports (`import('../pages/...')`)

## Development Patterns

### Component Conventions

- **Auto-imports** enabled for Vue/Router/Pinia APIs (via `unplugin-auto-import`)
- Icons: Use `mdi-js` (Material Design Icons JS), NOT `material-icons`
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

### Commands

- `quasar dev` - Start dev server with HMR
- `quasar build` - Build for web
- `quasar build -m pwa` - Build PWA (workbox service worker, 3MB cache limit)
- `quasar build -m capacitor -T android|ios` - Build mobile apps
- `npm run lint:fix` - Auto-fix linting issues (import ordering, etc.)

### Configuration

- **quasar.config.ts**: Boot files order: `app → quasar → v-viewer → dayjs → md-editor`
- **Build targets**: ES2022, modern browsers (Chrome/Firefox 115+, Safari 14+)
- **Code splitting**: Vendor chunks split by `md-editor-v3/codemirror` vs other node_modules
- **Environment**: `VUE_COMMIT_SHA` injected from Git (7 chars)

## Key Files & Patterns

### Multi-Platform Support

- `src-pwa/`: PWA service worker + manifest
- `src-capacitor/`: Mobile app configuration
- `src-electron/`: Desktop app entry points
- Shared codebase with platform-specific builds

### Composition Utilities

- `useResizeObserver`, `useMasonry`, `useMedia` - UI utilities
- `useTimeoutFn`, `useIsActivated` - Lifecycle helpers
- `useToNowRef` - Reactive time-based formatting (with dayjs)

### Critical Conventions

- **No test files exist** - focus on runtime behavior verification
- TypeScript strict mode **disabled** (`strict: false`)
- Session management: `longTermToken` (persistent) → refresh → `sessionToken` (memory)
- Sanitization: Use `sanitizeHtml` from utils, DOMPurify for HTML content
- BBCode support: Custom parser in `utils/bbcode/`

## Common Tasks

### Adding a New API Endpoint

1. Define types in `src/services/<domain>/types.ts`
2. Add method to `src/services/<domain>/index.ts` using `requestWithSignalr`
3. Handle cache via `updateResponseCache` if needed
4. Test disconnection scenario (cache fallback)

### Creating a New Page

1. Add route to `src/router/routes.ts` with `meta.requiresAuth`
2. Create page in `src/pages/<feature>/`
3. If needs data loading: Use `useInitRequest` with route activation awareness
4. If needs local state: Create store at `src/pages/<feature>/store.ts` named `page.<feature>`

### Debugging SignalR Issues

- Set `VUE_TRACE_SERVER=true` env variable
- Check `SignalrInspector` logs in console
- Verify `connectState` ref (Disconnected/Connecting/Connected)
- Test cache behavior: Disconnect network, check if cache returns data

### 其他项目指南

- 运行项目使用 `npm run dev` 命令，默认端口是 9000
- 项目已有时间格式化工具 `toNow(parseTime(timeString))` 在 `time.ts`，不要重复实现时间格式化逻辑。
