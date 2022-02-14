import { DB } from './base'

import type { ShelfItem } from '@/types/shelf'

export const shelfDB = new DB<ShelfItem>('USER_SHELF', '用于储存用户书架数据')
/**
 * 书架数据结构版本
 *
 * @key 'VER' 版本
 */
export const shelfStructVerDB = new DB<string>('APP_SHELF_STRUCT_VER', '书架数据结构版本')
export const userSettingDB = new DB<Record<string, unknown>>('SETTING', '设置缓存')
export const signalrCacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')
export const userAuthenticationDB = new DB<string>('USER_AUTHENTICATION', '用户授权信息')
export const userReadPositionDB = new DB<{ cid: number; xPath: string }>('USER_READ_POSITION', '用户阅读位置记录')
