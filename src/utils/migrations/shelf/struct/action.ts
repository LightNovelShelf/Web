import { ServerShelf } from '@/services/user/type'
import { ShelfItem, ShelfItemTypeEnum, SHELF_STRUCT_VER } from '@/types/shelf'
import { ShelfLegacyStruct } from './types'

/**
 * 书架数据结构版本合并逻辑
 *
 * @throws 没有 找到合适版本时会报错
 */
export async function shelfStructMigration(
  input: (ShelfItem | ServerShelf.Item | ShelfLegacyStruct.First.ShelfItem | ShelfLegacyStruct.First.ServerShelfItem)[],
  inputVer: SHELF_STRUCT_VER | null
): Promise<ShelfItem[]> {
  if (inputVer === SHELF_STRUCT_VER.LATEST) {
    return input as ShelfItem[]
  }

  // 最初的一版本没有版本号概念，入参null
  if (inputVer === null) {
    const res = input as (ShelfLegacyStruct.First.ShelfItem | ShelfLegacyStruct.First.ServerShelfItem)[]
    return res.map((item): ShelfItem => {
      let result: ShelfItem
      switch (item.type) {
        case ShelfLegacyStruct.First.ShelfItemType.BOOK: {
          result = {
            /** 类型 */
            type: ShelfItemTypeEnum.BOOK,
            /** Id,目前书籍的Id是数字，文件夹的是字符串 */
            id: item.value.Id,
            /** 次序 */
            index: item.index,
            /** 父级文件夹ID，不在文件夹的话就空数组 */
            parents: item.parents,
            /** 加入/更新时间，iso格式字符串 */
            updateAt: new Date().toISOString()
          }
          break
        }
        case ShelfLegacyStruct.First.ShelfItemType.FOLDER: {
          result = {
            /** 类型 */
            type: ShelfItemTypeEnum.FOLDER,
            /** Id,目前书籍的Id是数字，文件夹的是字符串 */
            id: item.value.Id,
            /** 次序 */
            index: item.index,
            /** 父级文件夹ID，不在文件夹的话就空数组 */
            parents: item.parents,
            /** 加入/更新时间，iso格式字符串 */
            updateAt: new Date(item.value.updateAt).toISOString(),
            /** 文件夹名称 */
            title: item.value.Title
          }
          break
        }

        default: {
          throw new Error(
            `shelfStructMigration:未知结构type: ${
              // @ts-expect-error
              item.type
            }`
          )
        }
      }

      return result
    })
  }

  throw new Error(`shelfStructMigration:未知结构版本: ${inputVer}`)
}
