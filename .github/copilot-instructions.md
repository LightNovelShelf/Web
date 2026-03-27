# 轻书架 (Light Novel Shelf) - AI Coding Instructions

## Project Overview

A PWA-focused online novel reading application built with **Quasar (Vue 3 + TypeScript)**.

## Architecture

### Communication Layer

- **SignalR WebSocket** (`src/services/internal/request/signalr/`) is the primary API protocol
- MessagePack + gzip compression
- Auto-reconnect with retry policy and request queue support
- Cache-first fallback is documented in `docs/缂撳瓨鏋舵瀯.md`
- `requestWithSignalr` is primary, `requestWithFetch` is fallback

### State Management

- Pinia stores follow the `app.*` and `page.*` naming convention
- Settings persist through IndexedDB / `localforage`
- Dark mode is managed locally

## Development Patterns

### Component Conventions

- Vue / Router / Pinia APIs are auto-imported
- Quasar components and directives are auto-imported
- Prefer `import type` for type-only imports

### Service Layer

- Services are organized by domain under `src/services/*`
- SignalR inspector logging can be enabled with `process.env.VUE_TRACE_SERVER`
- API failures should surface as `ServerError`

## Build & Development

### Commands

- `npm run dev` - start the local dev server
- `npm run build` - build the web app
- `npm run build:pwa` - build the PWA package
- `npm run lint:fix` - apply eslint autofixes

### Configuration Notes

- `quasar.config.ts` boot order: `app -> quasar -> v-viewer -> dayjs -> md-editor`
- Browser target: ES2022 and modern browsers
- PWA assets and service worker live under `src-pwa/`

## Key Directories

- `src/` - app source
- `src-pwa/` - PWA service worker and manifest files
- `docs/` - project documentation

## Common Tasks

### Add a new API endpoint

1. Define types in `src/services/<domain>/types.ts`
2. Add the request in `src/services/<domain>/index.ts`

### Create a new page

1. Add the route to `src/router/routes.ts`
2. Create the page under `src/pages/<feature>/`
3. Use `useInitRequest` when page data should refresh with route activation

### Debugging

- Start the project and inspect the browser console
- If auth is required, have the user complete login manually
- Use the running app to inspect API behavior and UI state
