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

function ascSorter<T extends { index: number }>(a: T, b: T): 1 | -1 {
  return a.index > b.index ? 1 : -1
}

/** 排序数组，immutable */
function sort(shelf: ShelfItem[]): ShelfItem[] {
  return produce(toRaw(shelf), (draft) => {
    draft.sort(ascSorter)
  })
}

/** 返回数组中最后一个元素; 数组长度为零时返回null */
function lastItem<T>(arr: T[]): T | null {
  return arr[arr.length - 1] ?? null
}

/** 根文件夹名称（系统保留值） */
export const ROOT_LEVEL_FOLDER_NAME = '根文件夹'

/** @private 书架store */
const shelfStore = defineStore('app.shelf', {
  state: () => INIT,
  getters: {
    /** 当前分支的全量项目 */
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
    /** 根据最后一层文件夹名称获取书籍 */
    getShelfByParent(): (parent: string | null) => ShelfItem[] {
      return (parent) => {
        return this.shelf.filter((i) => lastItem(i.parents) === parent)
      }
    },
    /** 获取指定层级的内容 */
    getShelfByParents(): (parents: string[]) => ShelfItem[] {
      return (parents: string[]) => {
        // 有可能是空字符串数组，过滤掉无效的那些空字符串
        const _parents = parents.filter((i) => !!i)
        return this.shelf.filter((i) => isEqual(i.parents, _parents))
      }
    },
    /** 根据书籍id批量获取书籍 */
    getBooksByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.booksMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 根据文件夹id批量获取文件夹 */
    getFolderByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.foldersMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 根据项目id批量获取书架内项目 */
    getItemByIDs(): (parents: string[]) => ShelfItem[] {
      return (itemID: string[]) => {
        return itemID.map((id: string) => this.shelfsMap.get(id)!).filter((o) => !!o)
      }
    },
    /** 当前书架数据里最大的index（为空时返回-1） */
    curMaxIndexInFolder(): (parent: string | null) => number {
      return (parent) => {
        let max = -1

        this.getShelfByParent(parent).forEach((item) => {
          max = Math.max(item.index, max)
        })

        return max
      }
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
    fetch(): Promise<ShelfItem[]> {
      return shelfDB.getItems()
    },

    /** push到db */
    async push() {
      // 先把db内容清空，不然source中删除的项目，没法把删除的这个操作，同步到db中
      await shelfDB.clear()
      for (const i of this.shelf) {
        await shelfDB.set(i.id, i)
      }
    },

    /** 切换分支 */
    checkout({ to: branch, reset = false }: { to: ShelfBranch; reset?: boolean }) {
      if (reset) {
        this.source[branch] = this.source[this.branch]
      }
      this.branch = branch
    },

    /**
     * 把书架内每层书籍的index“挤压”一次，把稀疏的index值重排回连续的、0起点的index
     *
     * @description
     * 如果不做这个操作就进行排序，会出现这个情况：
     * 书籍A index值1，书籍B index值3，AB书籍紧靠彼此
     *
     * 用户对调AB书籍，
     * 这时候会出现A的index值+1了还是比B小，排序结果保存失效
     */
    squeezeShelfItemIndex() {
      this.commit({
        shelf: produce(sort(toRaw(this.shelf)), (draft) => {
          /**
           * 最小index记录
           *
           * key是parents数组的最后一个值（代表直接父文件夹ID
           * value是遇到过的个数
           */
          const minIndexMap = new Map<string, number>()

          /** 表示顶层的数字 */
          const ROOT = '__ROOT__' + '.' + nanoid()

          draft.forEach((item) => {
            if (item.parents.length) {
              // 只有在数组不为空的时候会lastItem，所以这里一定有
              const parentID = lastItem(item.parents)!
              item.index = (minIndexMap.get(parentID) ?? -1) + 1
              minIndexMap.set(parentID, item.index)
            } else {
              item.index = (minIndexMap.get(ROOT) ?? -1) + 1
              minIndexMap.set(ROOT, item.index)
            }
          })
        })
      })
    },

    /** 把当前分支的数据覆盖到指定分支 */
    merge({ to }: { to: ShelfBranch }) {
      this.source[to] = this.source[this.branch]
    },

    /** 提交更改(覆盖) */
    commit({ shelf }: { shelf: ShelfItem[] }) {
      this.source[this.branch] = shelf
    },

    /** 从db中拉数据(pull = fetch + commit) */
    async pull() {
      const shelf = await this.fetch()
      this.commit({ shelf: sort(shelf) })
    },

    /** git end -------- */

    /** 校验失去关联的书架项目并修复数据中不合理的排布 */
    verifyFolderData() {
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

      // 更新记录
      this.commit({ shelf: sort(nextShelf) })

      // 根据排序结果重设一次index，保证index不是稀疏的
      this.squeezeShelfItemIndex()
    },
    /** 添加到书架，立即生效 */
    async addToShelf(book: ShelfBook) {
      const item: ShelfBookItem = {
        id: book.Id + '',
        type: ShelfItemType.BOOK,
        value: toRaw(book),
        parents: [],
        // 添加到书架默认就是第一层
        index: this.curMaxIndexInFolder(null) + 1
      }
      this.source[this.branch].push(item)
      await this.push()
    },
    /** 移出书架 */
    removeFromShelf(payload: { id: string; push: boolean }) {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => draft.filter((i) => i.id !== payload.id))
      })
      this.verifyFolderData()

      // 如果标记为立即push（比如 详请页 移出收藏 场景）
      if (payload.push) {
        this.push()
      }
    },
    /**
     * 记录排序
     *
     * 这里有一个比较绕的逻辑：传入的from/to都是界面上的index（初始状态下就是数组上的index，界面是按照数组顺序来渲染的）
     * 但操作时是跟item的index比较
     *
     * @description
     * 这个做法的原因是：
     * 1. 书架显示的书籍时当前文件夹内的项目，而数据库存储的是全部项目；直接拿展示的index去跟全部项目的index去比较肯定是不对应的
     * 2. 因为排序后的数组需要commit，所以以当前层的数据去遍历显然也不可行，这时候index对上了但是没法commit（内容只有本层的）
     * 3. 所以这里假定每次触发排序时；书架的index都是已经被挤压过的、item.index就是对应了书籍在文件夹的位置
     */
    commitSortInfo({ from, to, parents }: { from: number; to: number; parents: string[] }) {
      const maxIndex = Math.max(from, to)
      const minIndex = Math.min(from, to)

      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          // 不在范围内的书就不用动了
          // 老的index换成新的index
          // 剩下的依次左移/右移
          draft.forEach((item, index) => {
            // 不是本层的，不要动
            if (!isEqual(item.parents, parents)) {
              return
            }

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

          // 这个sort可要可不要；因为就算不sort，界面上的顺序还是跟item.index一样（即使这个时候数组的index跟item的index不一样）
          draft.sort(ascSorter)
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
    /** 添加到文件夹，排在现有内容之后；同时更新现有文件的所属关系 */
    addToFolder(payload: { books: string[]; folderID: string | null }) {
      /** map结构的books记录 */
      const booksInMap = new Map<string, null>()
      payload.books.forEach((id) => booksInMap.set(id, null))

      /** 目标文件夹的 最大index + 1 作为初始index */
      let index = this.curMaxIndexInFolder(payload.folderID) + 1

      this.commit({
        // 返回排序后的
        shelf: sort(
          // @ts-ignore
          produce(toRaw(this.shelf), (draft) => {
            draft.forEach((item) => {
              // 如果是待加入的项目，记录新的文件夹路径
              if (booksInMap.has(item.id)) {
                // 清掉选择状态，不然会导致数据一直认为有已选的项目
                item.selected = false
                // 重新赋值index
                item.index = index++
                // @todo 支持文件夹嵌套的话，传入一个完整路径来替换
                if (payload.folderID === null) {
                  item.parents = []
                } else {
                  item.parents = [payload.folderID]
                }
              } else if (item.id === payload.folderID && payload.folderID !== null) {
                // 如果是文件夹本身，就把那些书籍推进children里
                // 如果是根文件夹，那就不用做额外处理了，处理好书籍本身的就可以
                ;(item as ShelfFolderItem).value.children.push(
                  ...payload.books.map((id): ShelfFolderChild => ({ type: ShelfItemType.BOOK, id }))
                )
              }
            })
          })
        )
      })

      // 项目进入文件夹后，index有可能会生成空洞；挤掉
      this.verifyFolderData()
    },
    /** 新建文件夹, 返回文件夹ID */
    createFolder(payload: { name: string }): string {
      if (payload.name === ROOT_LEVEL_FOLDER_NAME) {
        Notify.create({
          type: 'negative',
          timeout: 1500,
          position: 'bottom',
          message: '该文件夹名字无效'
        })
        return ''
      }

      // 校验重名
      for (const folder of this.folders) {
        if (payload.name === folder.value.Title) {
          Notify.create({
            type: 'negative',
            timeout: 1500,
            position: 'bottom',
            message: '已有同名文件夹'
          })
          return ''
        }
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

      this.commit({
        shelf: produce(this.shelf, (draft) => {
          // 腾出首位
          draft.forEach((item) => {
            item.index += 1
          })

          // 压入首位
          draft.unshift(folder)
        })
      })

      this.verifyFolderData()

      return folderID
    },
    /** 重命名文件夹 */
    renameFolder(payload: { name: string; id: string }) {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const item of draft) {
            if (item.id === payload.id) {
              item.value.Title = payload.name
              return
            }
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
    store
      .pull()
      .then(() => store.verifyFolderData())
      .then(() => store.push())
  }

  return store
}
