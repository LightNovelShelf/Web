/** 书架条目类型枚举 */
export enum ShelfItemTypeEnum {
  /** 小说 */
  NOVEL = 'NOVEL',
  /** 漫画 */
  COMIC = 'COMIC',
  /** 文件夹 */
  FOLDER = 'FOLDER',
}

export enum SHELF_STRUCT_VER {
  V20260921 = '20260921',
}

/** 最新的书架结构版本号，随结构升级而改变 */
export const SHELF_STRUCT_VER_LATEST = SHELF_STRUCT_VER.V20260921
export const ROOT_LEVEL_FOLDER_NAME = '根文件夹'

interface ShelfCommonItem {
  /** 类型 */
  type: ShelfItemTypeEnum
  /** Id,目前书籍的Id是数字，文件夹的是字符串 */
  id: string | number
  /** 次序 */
  index: number
  /** 父级文件夹ID，不在文件夹的话就空数组 */
  parents: string[]
  /** 加入/更新时间，iso格式字符串 */
  updateAt: string
}

export interface ShelfBookItem extends ShelfCommonItem {
  type: ShelfItemTypeEnum.NOVEL | ShelfItemTypeEnum.COMIC
  id: number
}
export interface ShelfFolderItem extends ShelfCommonItem {
  type: ShelfItemTypeEnum.FOLDER
  id: string
  /** 文件夹名称 */
  title: string
}

export type ShelfItem = ShelfBookItem | ShelfFolderItem

/** 移动目标：已有的文件夹路径，或者在某个路径下新建的文件夹 */
export type ShelfFolderDestination =
  | { kind: 'existing'; parents: string[] }
  | { kind: 'new'; name: string; parents: string[] }

export function isShelfBookItem(item: ShelfItem): item is ShelfBookItem {
  return item.type !== ShelfItemTypeEnum.FOLDER
}
