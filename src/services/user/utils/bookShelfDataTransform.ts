import produce from 'immer'
import { ShelfItem, ShelfItemType, ShelfBook, ShelfFolderItem, ShelfBookItem } from '@/types/shelf'
import { getBookListByIds } from '@/services/book'

interface MiniShelfBookItem extends Omit<ShelfBookItem, 'value'> {
  // 仅保留ID
  value: Pick<ShelfBook, 'Id'>
}

export type MiniShelfItem = ShelfFolderItem | MiniShelfBookItem

/** 书架service层数据转换 */
export const bookShelfDataTransform = {
  TO_SERVER(input: ShelfItem[]): MiniShelfItem[] {
    return input.map((item): MiniShelfItem => {
      // selected一定没用，不用传上去服务器
      let minifyItem: MiniShelfItem = produce(item, (draft) => {
        delete draft.selected
      })

      // 简化book内容
      if (minifyItem.type === ShelfItemType.BOOK) {
        const book: MiniShelfItem = {
          ...minifyItem,
          value: { Id: minifyItem.value.Id }
        }

        minifyItem = book
      }

      return minifyItem
    })
  },
  async TO_LCOAL(input: MiniShelfItem[]): Promise<ShelfItem[]> {
    /** 补全好的书架数据结构 */
    const output: ShelfItem[] = []
    /** 分组的书籍id，每一组24个 */
    const bookIds: number[][] = [[]]
    /** 指针，指示现在在第几个“24本书” */
    let point = 0

    /** 把input分成24本一组 */
    input.forEach((item) => {
      if (item.type === ShelfItemType.BOOK) {
        if (bookIds[point].length >= 24) {
          point += 1
          bookIds[point] = []
        }

        bookIds[point].push(item.value.Id)
      }
    })

    /** 全部能拉回来的书籍 */
    const allBooks = new Map<number, ShelfBook>()
    await Promise.allSettled(bookIds.map((ids) => getBookListByIds(ids))).then((promises) => {
      promises.forEach((promise) => {
        if (promise.status === 'fulfilled') {
          promise.value.forEach((book) => {
            allBooks.set(book.Id, book)
          })
        }
      })
    })

    /** 循环input，把每一项处理成完整的local结构 */
    input.forEach((item) => {
      // 书籍的话需要补全
      if (item.type === ShelfItemType.BOOK) {
        if (!allBooks.has(item.value.Id)) {
          return
        }

        output.push({
          ...item,
          value: allBooks.get(item.value.Id)!
        })
        return
      }

      // 其余没特殊操作
      output.push(item)
    })

    return output
  }
}
