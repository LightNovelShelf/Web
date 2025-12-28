/* eslint-disable @typescript-eslint/triple-slash-reference */

// https://vite.dev/guide/features#client-types
// https://cdn.jsdelivr.net/npm/vite@7.2.0/client.d.ts
// node_modules\@quasar\app-vite\node_modules\vite
/// <reference path="./types/vite/client.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined
    VUE_ROUTER_BASE: string | undefined
    /** Code runs in development mode */
    DEV: boolean
    /** Code runs in production mode */
    PROD: boolean
    /** Code runs in development mode or `--debug` flag was set for production mode */
    DEBUGGING: boolean
    /** Quasar CLI mode (spa, pwa, …) */
    MODE: string

    // 环境变量
    VUE_APP_NAME: string
    VUE_APP_TOKEN_EXP_TIME: string
    VUE_SESSION_TOKEN_VALIDITY: string
    VUE_CAPTCHA_SITE_KEY: string
    VUE_TRACE_SERVER: string
    VUE_COMMIT_SHA: string
  }
}

interface ImportMetaEnv {
  // import.env
  // if need
}
