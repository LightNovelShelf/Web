import { DB } from './base'
export { DB }

export const shelfDB = new DB('USER_SHELF', '用于储存用户书架数据')
export const userSettingDB = new DB('SETTING', '设置缓存')
export const signalrCacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')
export const userAuthenticationDB = new DB('USER_AUTHENTICATION', '用户授权信息')
export const userReadPositionDB = new DB('USER_READ_POSITION', '用户阅读位置记录')
