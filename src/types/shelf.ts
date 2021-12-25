import { BookServicesTypes } from '@/services/book'

/** 书架书籍 */
export interface ShelfBook extends BookServicesTypes.BookInList {}
/** 书架文件夹 */
export interface ShelfFolder {
  /** 文件夹Id，尽量跟Book同名方便模板书写 */
  Id: string
  /** 文件夹名称，尽量跟Book同名方便模板书写 */
  Title: string
  /** 文件夹内书籍 */
  children: ShelfBookItem[]
  /** 更改时间，iso格式 */
  updateAt: string
}

/** 书架条目类型枚举 */
export enum SheldItemType {
  /** 书籍 */
  BOOK = 'BOOK',
  /** 文件夹 */
  FOLDER = 'FOLDER'
}

/** 书架条目共享字段 */
export interface ShelfCommonItem {
  /** 类型 */
  type: SheldItemType
  /** 次序 */
  index: number
  /** 选中态 */
  selected?: boolean
}

/** 书架 - 书籍 */
export interface ShelfBookItem extends ShelfCommonItem {
  type: SheldItemType.BOOK
  value: ShelfBook
}
/** 书架 - 文件夹 */
export interface ShelfFolderItem extends ShelfCommonItem {
  type: SheldItemType.FOLDER
  value: ShelfFolder
}

export type ShelfItem = ShelfBookItem | ShelfFolderItem
