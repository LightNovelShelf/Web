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
  }
}
