import { defineStore } from 'pinia'
import { ShelfBook, ShelfBookItem, ShelfFolderItem, ShelfItem, ShelfItemType } from '@/types/shelf'
import { shelfDB } from '@/utils/storage/db'
import { toRaw } from 'vue'
import produce from 'immer'
import { isEqual } from 'lodash-es'

export interface ShelfStore {
  _first: boolean
  shelf: ShelfItem[]
}

/** 初始state */
const INIT: ShelfStore = {
  _first: true,
  shelf: []
}

/** @private 书架store */
const shelfStore = defineStore('app.shelf', {
  state: () => INIT,
  getters: {
    /** 所有书籍（包括已经被放入文件夹的） */
    books(state): ShelfBookItem[] {
      return state.shelf.filter((i): i is ShelfBookItem => i.type === ShelfItemType.BOOK)
    },
    /** 所有文件夹 */
    folders(state): ShelfFolderItem[] {
      return state.shelf.filter((i): i is ShelfFolderItem => i.type === ShelfItemType.FOLDER)
    },
    /** 获取指定层级的内容 */
    getShelfByID(state): (parents: string[]) => ShelfItem[] {
      return (parents: string[]) => {
        return state.shelf.filter((i) => isEqual(i.parents, parents))
      }
    },
    /** 当前书架数据里最大的index（为空时返回-1） */
    curMaxShelfIndex(state): number {
      let max = -1

      state.shelf.forEach(({ index }) => {
        max = Math.max(index, max)
      })

      return max
    },
    /** map格式的书籍数据，方便查找 */
    booksMap(state): Map<string, ShelfBookItem> {
      const map = new Map<string, ShelfBookItem>()
      this.books.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    },
    /** map格式的文件夹数据，方便查找 */
    foldersMap(state): Map<string, ShelfFolderItem> {
      const map = new Map<string, ShelfFolderItem>()
      this.folders.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    },
    /** map格式的shelf数据，方便查找 */
    shelfsMap(state): Map<string, ShelfItem> {
      const map = new Map<string, ShelfItem>()
      state.shelf.forEach((item) => {
        map.set(item.id, item)
      })
      return map
    }
  },
  actions: {
    async readDB() {
      this.shelf = await shelfDB.getItems()
    },
    async writeDB() {
      await shelfDB.clear()
      for (const i of this.shelf) {
        await shelfDB.set(i.id, i)
      }
    },
    /** 校验书架文件夹ID是否有失效 */
    async verifyFolderData() {
      let nextShelf: ShelfItem[] = toRaw(this.shelf)

      this.shelf.forEach((item, folderIdx) => {
        switch (item.type) {
          // 书架的书籍，不用管
          case ShelfItemType.BOOK: {
            break
          }
          // 书架的文件夹，进入清理逻辑
          case ShelfItemType.FOLDER: {
            // 遍历文件夹中内容
            item.value.children.forEach(({ id, type }, childIdx) => {
              switch (type) {
                // 文件夹中的书籍
                case ShelfItemType.BOOK: {
                  // 发现无效的书籍ID
                  if (!this.booksMap.has(id)) {
                    nextShelf = produce(nextShelf, (draft) => {
                      ;(draft[folderIdx] as ShelfFolderItem).value.children.splice(childIdx, 1)
                    })
                  }
                  break
                }
                // 文件夹中的文件夹
                case ShelfItemType.FOLDER: {
                  // 发现无效的文件夹ID
                  if (!this.foldersMap.has(id)) {
                    nextShelf = produce(nextShelf, (draft) => {
                      ;(draft[folderIdx] as ShelfFolderItem).value.children.splice(childIdx, 1)
                    })
                  }
                  break
                }
                default: {
                  break
                }
              }
            })
            break
          }
          default: {
            break
          }
        }
      })

      // 如果有更改
      if (nextShelf !== toRaw(this.folders)) {
        // 更新记录
        this.shelf = nextShelf
        // 写到DB
        this.writeDB()
      }
    },
    /** 添加到收藏 */
    async addToShelf(book: ShelfBook) {
      const item: ShelfBookItem = {
        id: book.Id + '',
        type: ShelfItemType.BOOK,
        value: toRaw(book),
        parents: [],
        index: this.curMaxShelfIndex + 1
      }
      this.shelf.push(item)
      await this.writeDB()
    },
    /** 移出收藏 @param bookId 书籍的id */
    async removeFromShelf(bookId: number | string) {
      this.shelf = this.shelf.filter((i) => i.id !== bookId + '')
      await this.writeDB()
    }
  }
})

/** @public 书架store */
export function useShelfStore() {
  const store = shelfStore()

  // 第一次使用的时候，自动读取一次DB，避免每次使用store都要注意init
  if (store._first) {
    store.$patch({ _first: false })
    store.readDB().then(() => store.verifyFolderData())
  }

  return store
}
