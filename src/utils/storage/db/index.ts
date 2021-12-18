import { DB } from './base'
export { DB }

import type { SheldItem } from '@/types/shelf'

export const shelfDB = new DB<SheldItem>('USER_SHELF', '用于储存用户书架数据')
export const userSettingDB = new DB('SETTING', '设置缓存')
export const signalrCacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')
export const userAuthenticationDB = new DB('USER_AUTHENTICATION', '用户授权信息')
