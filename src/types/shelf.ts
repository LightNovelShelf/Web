import { BookServicesTypes } from '@/services/book'

/** 书架书籍 */
export interface ShelfBook extends BookServicesTypes.BookInList {}

/** 书架文件夹子数据 */
export interface ShelfFolderChild {
  id: string
  type: ShelfItemType
}
/** 书架文件夹 */
export interface ShelfFolder {
  /** 文件夹Id，尽量跟Book同名方便模板书写 */
  Id: string
  /** 文件夹名称，尽量跟Book同名方便模板书写 */
  Title: string
  /** 更改时间，iso格式字符串 */
  updateAt: string
}

/** 书架条目类型枚举 */
export enum ShelfItemType {
  /** 书籍 */
  BOOK = 'BOOK',
  /** 文件夹 */
  FOLDER = 'FOLDER'
}

/** 书架条目共享字段 */
export interface ShelfCommonItem {
  /** 类型 */
  type: ShelfItemType
  /** Id */
  id: string
  /** 次序 */
  index: number
  /** 父级文件夹ID，不在文件夹的话就空数组 */
  parents: string[]
  /** 选中态 */
  selected?: boolean
}

/** 书架 - 书籍 */
export interface ShelfBookItem extends ShelfCommonItem {
  type: ShelfItemType.BOOK
  value: ShelfBook
}
/** 书架 - 文件夹 */
export interface ShelfFolderItem extends ShelfCommonItem {
  type: ShelfItemType.FOLDER
  value: ShelfFolder
}

export type ShelfItem = ShelfBookItem | ShelfFolderItem
