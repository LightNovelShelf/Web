import { DB } from './base'
export { DB }

import type { ShelfBookItem, ShelfFolderItem, ShelfItem } from '@/types/shelf'

export const shelfDB = new DB<ShelfItem>('USER_SHELF', '用于储存用户书架数据')
export const shelfBookDB = new DB<ShelfBookItem>('USER_SHELF_BOOK', '用于储存书架中书籍类型的数据')
export const shelfFolderDB = new DB<ShelfFolderItem>('USER_SHELF_FOLDER', '用于储存书架中文件夹类型的数据')
export const userSettingDB = new DB('SETTING', '设置缓存')
export const signalrCacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')
export const userAuthenticationDB = new DB('USER_AUTHENTICATION', '用户授权信息')
export const userReadPositionDB = new DB('USER_READ_POSITION', '用户阅读位置记录')
