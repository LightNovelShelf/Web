declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'minimasonry' {
  const foo: any
  export default foo
}

/** 开发模式 */
declare const __DEV__: boolean

/** 源站地址 */
declare const VUE_APP_SERVER: string
/** API服务地址 */
declare const VUE_APP_API_SERVER: string
/** 人机检查密钥 */
declare const VUE_CAPTCHA_SITE_KEY: string
/** token有效期，ms；当前是30s */
declare const VUE_APP_TOKEN_EXP_TIME: string
/** APP标识，方便多实例共享localhost等域名时，区分cache前缀 */
declare const VUE_APP_NAME: string
/** 版本号VER */
declare const VUE_APP_VER: string
/** 是否打印ws的返回信息 */
declare const VUE_TRACE_SERVER: string
