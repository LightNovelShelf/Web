import type { BookServicesTypes } from 'src/services/book'

/** 书架书籍 */
interface ShelfBook extends BookServicesTypes.BookInList {}

/** 书架文件夹 */
interface ShelfFolder {
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
  FOLDER = 'FOLDER',
}

/** 书架条目共享字段 */
interface ShelfCommonItem {
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
interface ShelfBookItem extends ShelfCommonItem {
  type: ShelfItemType.BOOK
  value: ShelfBook
}
/** 书架 - 文件夹 */
interface ShelfFolderItem extends ShelfCommonItem {
  type: ShelfItemType.FOLDER
  value: ShelfFolder
}

// type ShelfItem = ShelfBookItem | ShelfFolderItem

interface MiniShelfBookItem extends Omit<ShelfBookItem, 'value'> {
  // 仅保留ID
  value: Pick<ShelfBook, 'Id'>
}

// 之前signal的message pack协议会自动 parse iso字符串为Date，现在改传gzip后的json字符串，没这个处理了
// interface ServerShelfFolderItem extends Omit<ShelfFolderItem, 'value'> {
//   value: Omit<ShelfFolder, 'updateAt'> & { updateAt: Date | string }
// }

/** 服务器裁剪过后的数据 */
export type ServerShelfItem = ShelfFolderItem | MiniShelfBookItem
