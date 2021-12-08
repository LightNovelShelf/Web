/** 数据库名称常量，因为要求全局唯一，所以这里使用中心化记录来保证唯一性 */
export const DB_NAME = {
  /** signal请求缓存 */
  SIGNALR_CACHE: 'SIGNALR_CACHE',
  /** 用户设置记录 */
  USER_SETTING: 'SETTING',
  /** 用户授权信息 */
  USER_AUTHENTICATION: 'USER_AUTHENTICATION'
}
