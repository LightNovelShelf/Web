/** 书架条目类型枚举 */
export enum ShelfItemTypeEnum {
  /** 书籍 */
  BOOK = 'BOOK',
  /** 文件夹 */
  FOLDER = 'FOLDER'
}

interface ShelfCommonItem {
  /** 类型 */
  type: ShelfItemTypeEnum
  /** Id,目前书籍的Id是数字，文件夹的是字符串 */
  id: string | number
  /** 次序 */
  index: number
  /** 父级文件夹ID，不在文件夹的话就空数组 */
  parents: string[]
  /** 选中态 */
  selected?: boolean
  /** 名称 */
  title: string
  /** 加入/更新时间，iso格式字符串 */
  updateAt: string
}

export interface ShelfBookItem extends ShelfCommonItem {
  type: ShelfItemTypeEnum.BOOK
  id: number
}
export interface ShelfFolderItem extends ShelfCommonItem {
  type: ShelfItemTypeEnum.FOLDER
  id: string
}

export type ShelfItem = ShelfBookItem | ShelfFolderItem
