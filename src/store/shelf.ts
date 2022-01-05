import { defineStore } from 'pinia'
import { ShelfBook, ShelfBookItem, ShelfFolderChild, ShelfFolderItem, ShelfItem, ShelfItemType } from '@/types/shelf'
import { shelfDB } from '@/utils/storage/db'
import { toRaw } from 'vue'
import produce, { setAutoFreeze } from 'immer'
import { isEqual } from 'lodash-es'
import { Notify } from 'quasar'
import { nanoid } from 'nanoid'

export enum ShelfBranch {
  main = 'main',
  draft = 'draft'
}
type ShelfSourceStruct = {
  [key in ShelfBranch]: ShelfItem[]
}

export interface ShelfStore {
  _first: boolean
  source: ShelfSourceStruct
  branch: ShelfBranch
}

/** 初始state */
const INIT: ShelfStore = {
  _first: true,
  source: {
    [ShelfBranch.main]: [],
    [ShelfBranch.draft]: []
  },
  branch: ShelfBranch.main
}

/** @private 书架store */
const shelfStore = defineStore('app.shelf', {
  state: () => INIT,
  getters: {
    shelf(): ShelfItem[] {
      return this.source[this.branch]
    },
    /** 所有书籍（包括已经被放入文件夹的） */
    books(): ShelfBookItem[] {
      return this.shelf.filter((i): i is ShelfBookItem => i.type === ShelfItemType.BOOK)
    },
    /** 所有文件夹 */
    folders(): ShelfFolderItem[] {
      return this.shelf.filter((i): i is ShelfFolderItem => i.type === ShelfItemType.FOLDER)
    },
    /** 获取指定层级的内容 */
    getShelfByParents(): (parents: string[]) => ShelfItem[] {
      return (parents: string[]) => {
        // 有可能是空字符串数组，过滤掉无效的那些空字符串
        const _parents = parents.filter((i) => !!i)
        return this.shelf.filter((i) => isEqual(i.parents, _parents))
      }
    },
    /** 获取指定层级的内容 */
    getBooksByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.booksMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 获取指定层级的内容 */
    getFolderByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.foldersMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 获取指定层级的内容 */
    getItemByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.shelfsMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 当前书架数据里最大的index（为空时返回-1） */
    curMaxShelfIndex(): number {
      let max = -1

      this.shelf.forEach(({ index }) => {
        max = Math.max(index, max)
      })

      return max
    },
    /** map格式的书籍数据，方便查找 */
    booksMap(): Map<string, ShelfBookItem> {
      const map = new Map<string, ShelfBookItem>()
      this.books.forEach((item) => {
        map.set(item.id, toRaw(item))
      })
      return map
    },
    /** map格式的文件夹数据，方便查找 */
    foldersMap(): Map<string, ShelfFolderItem> {
      const map = new Map<string, ShelfFolderItem>()
      this.folders.forEach((item) => {
        map.set(item.id, toRaw(item))
      })
      return map
    },
    /** map格式的shelf数据，方便查找 */
    shelfsMap(): Map<string, ShelfItem> {
      const map = new Map<string, ShelfItem>()
      this.shelf.forEach((item) => {
        map.set(item.id, toRaw(item))
      })
      return map
    },
    /** 选中计数 */
    selectedNum(): number {
      return this.shelf.filter((i) => i.selected).length
    }
  },
  actions: {
    /** git ------------ */
    /** 从db中拉数据 */
    async pull() {
      const db = (await shelfDB.getItems()).sort((a, b) => (a.index > b.index ? 1 : -1))
      // 设定当前分支；可以理解为 git pull
      this.source[this.branch] = db

      // 其它branch在checkout的时候才维护
    },

    /** push到db */
    async push() {
      await shelfDB.clear()
      for (const i of this.shelf) {
        await shelfDB.set(i.id, i)
      }
    },

    /** 切换分支 */
    async checkout({ to: branch, reset = false }: { to: ShelfBranch; reset?: boolean }) {
      if (reset) {
        this.source[branch] = this.source[this.branch]
      }
      this.branch = branch
    },

    /** 把当前分支的数据覆盖到指定分支 */
    async merge({ to }: { to: ShelfBranch }) {
      this.source[to] = this.source[this.branch]
    },

    /** 提交更改(覆盖) */
    async commit({ shelf }: { shelf: ShelfItem[] }) {
      this.source[this.branch] = shelf
    },

    /** git end -------- */

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
        this.source[this.branch] = nextShelf
        // 写到DB
        this.push()
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
      this.source[this.branch].push(item)
      await this.push()
    },
    /** 移出收藏 @param bookId 书籍的id */
    async removeFromShelf(bookId: number | string) {
      this.source[this.branch] = this.source[this.branch].filter((i) => i.id !== bookId + '')
      await this.push()
    },
    /** 记录排序 */
    commitSortInfo({ from, to }: { from: number; to: number }) {
      const maxIndex = Math.max(from, to)
      const minIndex = Math.min(from, to)

      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          // 不在范围内的书就不用动了
          // 老的index换成新的index
          // 剩下的依次左移/右移
          draft.forEach((item) => {
            if (item.index < minIndex || item.index > maxIndex) {
              return
            }

            if (item.index === from) {
              item.index = to
            } else if (from === minIndex) {
              // 从小拖到大，左移填充老的那个位置
              item.index -= 1
            } else {
              // 从大拖到小，右移填充老的那个位置
              item.index += 1
            }
          })
        })
      })
    },
    /** 选中记录 */
    selectItem(payload: { id: string; selected?: boolean }) {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const item of draft) {
            if (item.id === payload.id) {
              if (item.type === ShelfItemType.FOLDER) {
                return
              }

              item.selected = payload.selected ?? !item.selected
              return
            }
          }
        })
      })
    },
    /** 清空选中记录 */
    clearSelected() {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          draft.forEach((item) => {
            item.selected = false
          })
        })
      })
    },
    /** 添加到文件夹 */
    addToFolder(payload: { books: string[]; folderID: string }) {
      const _map = new Map<string, null>()
      payload.books.forEach((id) => _map.set(id, null))

      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          draft.forEach((item) => {
            // 如果是待加入的项目，记录深一层文件夹路径
            if (_map.has(item.id)) {
              // 清掉选择状态，不然会导致数据一直认为有已选的项目
              item.selected = false
              item.parents.unshift(payload.folderID)
            } else if (item.id === payload.folderID) {
              // 如果是文件夹本身，就把那些书籍推进children里
              ;(item as ShelfFolderItem).value.children.push(
                ...payload.books.map((id): ShelfFolderChild => ({ type: ShelfItemType.BOOK, id }))
              )
            }
          })
        })
      })
    },
    /** 新建文件夹, 返回文件夹ID */
    createFolder(payload: { name: string }): string {
      // 校验重名
      for (const folder of this.folders) {
        if (payload.name === folder.value.Title) {
          Notify.create({
            type: 'negative',
            timeout: 1500,
            position: 'bottom',
            message: '已有同名文件夹'
          })
        }
        return ''
      }

      const folderID = nanoid()

      /** 新的文件夹 */
      const folder: ShelfFolderItem = {
        // 固定在第一
        index: 0,
        type: ShelfItemType.FOLDER,
        parents: [],
        id: folderID,
        value: {
          Id: folderID,
          Title: payload.name,
          children: [],
          updateAt: new Date().toISOString()
        }
      }

      this.source[this.branch] = produce(toRaw(this.source[this.branch]), (draft) => {
        // 腾出首位
        draft.forEach((item) => {
          item.index += 1
        })

        // 压入首位
        draft.unshift(folder)
      })

      return folderID
    },
    /** 重命名文件夹 */
    renameFolder(payload: { name: string; id: string }) {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const item of draft) {
            if (item.id === payload.id) {
              item.value.Title = payload.name
            }
            return
          }
        })
      })
    }
  }
})

/** @public 书架store */
export function useShelfStore() {
  const store = shelfStore()

  /** auto freeze的话会导致vue绑定报错 */
  setAutoFreeze(false)

  // 第一次使用的时候，自动读取一次DB，避免每次使用store都要注意init
  if (store._first) {
    store.$patch({ _first: false })
    store.pull().then(() => store.verifyFolderData())
  }

  return store
}
