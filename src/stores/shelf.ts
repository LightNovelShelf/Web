import { defineStore } from 'pinia'
import { ShelfItem, ShelfBookItem, ShelfFolderItem, ShelfItemTypeEnum, SHELF_STRUCT_VER } from 'src/types/shelf'
import { shelfDB, shelfStructVerDB } from 'src/utils/storage/db'
import { toRaw } from 'vue'
import { produce } from 'immer'
import isEqual from 'lodash.isequal'
import { Notify } from 'quasar'
import { nanoid } from 'nanoid'
import { getBookShelfBinary, saveBookShelf } from 'src/services/user'

export enum ShelfBranch {
  main = 'main',
  draft = 'draft'
}
type ShelfSourceStruct = {
  [key in ShelfBranch]: ShelfItem[]
}

export interface ShelfStore {
  /** 是否已经初始化 */
  initialized: boolean
  /** 选中项ID集合 */
  selected: Set<number | string>
  source: ShelfSourceStruct
  branch: ShelfBranch
}

/** 初始state */
function STATE(): ShelfStore {
  return {
    initialized: false,
    selected: new Set(),
    source: {
      [ShelfBranch.main]: [],
      [ShelfBranch.draft]: []
    },
    branch: ShelfBranch.main
  }
}

/**
 * 升序排序
 *
 * @description
 * 注意sort实现的差异
 * 1. es2019 开始要求sort算法必须是稳定算法（也就是同index时保证不交换），在此之前看js引擎心情
 * 2. sort返回值的意思：
 *  - 返回 >0 把b放在a之前
 *  - 返回 =0 不动
 *  - 返回 <0 把b放在a之前
 *
 * @url https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability
 */
function ascSorter<T extends ShelfItem>(a: T, b: T): number {
  // 两个值index一致的情况下，需要细化场景，保证排序操作稳定
  if (a.index === b.index) {
    // index相同目前只有一种可能：两者的层级不一样；这时候按照层级排一次就可以保证稳定了
    return a.parents.length - b.parents.length
  }
  return a.index - b.index
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

export interface ShelfFolderTreeItem extends ShelfFolderItem {
  children: ShelfFolderTreeItem[]
}

/** 把list形式的文件夹还原回 children 形式的数据格式 */
function folderList2FolderTree(folderList: ShelfFolderItem[]): ShelfFolderTreeItem[] {
  // 1. 根据文件夹层级先排升序（parents长度）：这一步操作是为了实现确保循环时子文件夹一定在父文件夹之后出现
  // 2. 每一个文件夹都压入到map中，同时如果有parents的话，还会把自己压入parents数组中最后一个id的children数组中
  // 3. 循环完所有文件夹，必定保证了：文件夹既出现在map中，也一定出现在直属文件夹的children数组中
  // 4. 拿出map中所有parents数组为空的文件夹（位于根文件夹的文件夹）

  const sortedFolderList = toRaw(folderList)
    .slice()
    .sort((a, b) => (a.parents.length > b.parents.length ? 1 : -1))
  console.log('sortedFolderList', sortedFolderList)
  return []
}

/** @private 书架store */
const shelfStore = defineStore({
  id: 'app.shelf',
  state: STATE,
  getters: {
    /** 当前分支的全量项目 */
    shelf(): ShelfItem[] {
      return this.source[this.branch]
    },
    /** 当前分支的全量项目 */
    shelfInMap(): Map<string | number, ShelfItem> {
      return new Map<string | number, ShelfItem>(this.shelf.map((i) => [i.id, i]))
    },
    /** 所有书籍（包括已经被放入文件夹的） */
    books(): ShelfBookItem[] {
      return toRaw(this.shelf).filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
    },
    /** 所有文件夹 */
    folders(): ShelfFolderItem[] {
      return toRaw(this.shelf).filter((i): i is ShelfFolderItem => i.type === ShelfItemTypeEnum.FOLDER)
    },
    /** 所有文件夹 */
    foldersInTree(): ShelfFolderTreeItem[] {
      return folderList2FolderTree(this.folders)
    },
    /** 根据最后一层文件夹名称获取书籍 */
    getItemsByParent(): (parent: string | number | null) => ShelfItem[] {
      return (parent) => {
        return toRaw(this.shelf).filter((i) => lastItem(i.parents) === parent)
      }
    },
    /** 根据文件夹路径获取内容 */
    getItemsByParents(): (parents: string[]) => ShelfItem[] {
      return (parents: string[]) => {
        // 有可能是空字符串数组，过滤掉无效的那些空字符串
        const _parents = parents.filter((i) => !!i)
        return toRaw(this.shelf).filter((i) => isEqual(i.parents, _parents))
      }
    },
    /** 当前书架数据里最大的index（为空时返回-1） */
    curMaxIndexInFolder(): (parent: string | null) => number {
      return (parent) => {
        let max = -1

        this.getItemsByParent(parent).forEach((item) => {
          max = Math.max(item.index, max)
        })

        return max
      }
    },
    /** map格式的书籍数据，方便查找 */
    booksMap(): Map<number, ShelfBookItem> {
      const map = new Map<number, ShelfBookItem>()
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
        map.set(item.id + '', toRaw(item))
      })
      return map
    },
    /** 选中计数 */
    selectedCount(): number {
      return this.selected.size
    },
    /** 选中的书籍 */
    selectedBooks(): ShelfBookItem[] {
      return this.shelf.filter(
        (i): i is ShelfBookItem => !!(i.type === ShelfItemTypeEnum.BOOK && this.selected.has(i.id))
      )
    }
  },
  actions: {
    /** git ------------ */
    /** 从db中拉数据 */
    async fetch(): Promise<ShelfItem[]> {
      return this.squeezeShelfItemIndex(await shelfDB.getItems())
    },

    /** push到db */
    async push(config: { syncRetome?: boolean } = {}) {
      /** 记录的时候结构一定是最新的 */
      await shelfStructVerDB.set('VER', SHELF_STRUCT_VER.LATEST)

      this.commit({
        shelf: this.squeezeShelfItemIndex(toRaw(this.shelf))
      })

      // 先把db内容清空，不然source中删除的项目，没法把删除的这个操作，同步到db中
      await shelfDB.clear()

      for (const i of this.shelf) {
        await shelfDB.set(i.id + '', i)
      }

      if (config.syncRetome) {
        await this.syncToRemote()
      }
    },

    /** 切换分支 */
    checkout({ to: branch, reset = false }: { to: ShelfBranch; reset?: boolean }) {
      if (reset) {
        this.source[branch] = this.source[this.branch]
      }
      this.branch = branch
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
      const structVer = await shelfStructVerDB.get<SHELF_STRUCT_VER>('VER')

      // 如果版本不对，丢掉，多兼容一份数据逻辑有点烦了，等服务器返回就好
      if (structVer !== SHELF_STRUCT_VER.LATEST) {
        this.commit({ shelf: [] })
        this.push({ syncRetome: false })
        return
      }

      this.commit({ shelf })
    },

    /** git end -------- */

    /** 从服务器同步 */
    async syncFromRemote() {
      const serve = await getBookShelfBinary()
      let shelf: ShelfItem[]

      if (serve.ver !== SHELF_STRUCT_VER.LATEST) {
        shelf = await (
          await import('src/utils/migrations/shelf/struct/action')
        ).shelfStructMigration(serve.data, serve.ver ?? null)
      } else {
        shelf = serve.data as ShelfItem[]
      }

      // 记录版本到本地
      this.commit({ shelf: this.squeezeShelfItemIndex(shelf) })

      // 如果版本不对那就触发一次push
      if (serve.ver !== SHELF_STRUCT_VER.LATEST) {
        this.push({ syncRetome: true })
      }
    },
    /** 同步到服务器 */
    async syncToRemote() {
      await saveBookShelf({ data: toRaw(this.shelf), ver: SHELF_STRUCT_VER.LATEST })
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
    squeezeShelfItemIndex(curShelf: ShelfItem[]): ShelfItem[] {
      return produce(sort(toRaw(curShelf)), (draft) => {
        /** 一个带前缀randomID表示顶层文件夹 */
        const ROOT = '__ROOT__' + '.' + nanoid()

        /**
         * 当前index记录
         *
         * key是parents数组的最后一个值（代表直接父文件夹ID），ROOT代表根文件夹
         * value是遇到过的个数
         */
        const minIndexMap = new Map<string, number>()

        draft.forEach((item) => {
          if (item.parents.length) {
            // 只有在数组不为空的时候会lastItem，所以这里一定有
            const parentID = lastItem(item.parents)!
            // 更新当前index为最小index+1
            item.index = (minIndexMap.get(parentID) ?? -1) + 1
            // 记录该index
            minIndexMap.set(parentID, item.index)
          } else {
            item.index = (minIndexMap.get(ROOT) ?? -1) + 1
            minIndexMap.set(ROOT, item.index)
          }
        })
      })
    },

    /** 添加书籍到书架，立即生效 */
    async addToShelf(payload: { id: number }) {
      const item: ShelfBookItem = {
        id: payload.id,
        type: ShelfItemTypeEnum.BOOK,
        // 添加到书架默认就是添加到root @todo 支持添加到指定文件夹
        parents: [],
        // 添加到首位
        index: 0,
        updateAt: new Date().toISOString()
      }
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          // 压入数据
          draft.unshift(item)
          // 更新其它同层项目的index
          draft.forEach((item) => {
            const root: string[] = []
            if (isEqual(item.parents, root)) {
              item.index += 1
            }
          })
        })
      })
      await this.push({ syncRetome: true })
    },
    /** 移出书架 */
    async removeFromShelf(payload: { books: (string | number)[]; push: boolean }) {
      const items = new Set(payload.books)

      this.commit({
        // 移出后index就会出现空洞，squeeze一次
        shelf: this.squeezeShelfItemIndex(
          // 删除项目
          produce(toRaw(this.shelf), (draft) => draft.filter((i) => !items.has(i.id)))
        )
      })

      // 如果标记为立即push（比如 详请页 移出收藏 场景）
      if (payload.push) {
        await this.push({ syncRetome: true })
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
        shelf: this.squeezeShelfItemIndex(
          produce(toRaw(this.shelf), (draft) => {
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
          })
        )
      })
    },
    /** 选中记录 */
    selectItem(payload: { id: string | number; selected?: boolean }) {
      const nextSelected = payload.selected ?? !this.selected.has(payload.id)
      if (nextSelected) {
        this.selected.add(payload.id)
      } else {
        this.selected.delete(payload.id)
      }
    },
    /** 清空选中记录 */
    clearSelected() {
      this.selected = new Set()
    },
    /** 添加到文件夹 */
    addToFolder(payload: { parents: string[] }) {
      this.commit({
        shelf: this.squeezeShelfItemIndex(
          produce(toRaw(this.shelf), (draft) => {
            draft.forEach((item) => {
              // 如果是待加入的项目，记录新的文件夹路径
              if (this.selected.has(item.id)) {
                // 排在开头
                item.index = 0

                item.parents = payload.parents
              } else if (isEqual(item.parents, payload.parents)) {
                item.index += 1
              }
            })
          })
        )
      })

      // 清掉选择状态，不然会导致数据一直认为有已选的项目
      this.clearSelected()
    },
    /** 新建文件夹, 返回文件夹ID */
    createFolder(payload: { name: string; parents: string[] }): string {
      const parents = payload.parents
      const isSameArr = <T extends any[]>(arr1: T, arr2: T): boolean => {
        if (arr1.length !== arr2.length) {
          return false
        }

        const len = arr1.length

        for (let idx = 0; idx < len - 1; idx += 1) {
          if (arr1[idx] !== arr2[idx]) {
            return false
          }
        }

        return true
      }

      const sameLevelFolderList = this.folders.filter((s) => isSameArr(s.parents, parents))

      // 校验重名
      for (const folder of sameLevelFolderList) {
        if (payload.name === folder.title) {
          Notify.create({
            type: 'negative',
            timeout: 1500,
            position: 'bottom',
            message: '已有同名文件夹'
          })
          return ''
        }
      }

      const newFolderID = nanoid()

      /** 新的文件夹 */
      const folder: ShelfFolderItem = {
        // 固定在第一
        index: 0,
        type: ShelfItemTypeEnum.FOLDER,
        parents: parents,
        id: newFolderID,
        title: payload.name,
        updateAt: new Date().toISOString()
      }

      this.commit({
        shelf: this.squeezeShelfItemIndex(
          produce(this.shelf, (draft) => {
            // 腾出首位
            draft.forEach((item) => {
              item.index += 1
            })

            // 压入首位
            draft.unshift(folder)
          })
        )
      })

      return newFolderID
    },
    /** 重命名文件夹 */
    renameFolder(payload: { name: string; id: string }) {
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const item of draft) {
            if (item.type === ShelfItemTypeEnum.FOLDER && item.id === payload.id) {
              item.title = payload.name
              return
            }
          }
        })
      })
    },
    /** 删除文件夹 */
    deleteFolder(payload: { id: string }) {
      this.commit({
        shelf: this.squeezeShelfItemIndex(
          // @ts-ignore
          produce(toRaw(this.shelf), (draft) => {
            let currentMaxIndex = this.curMaxIndexInFolder(null)

            let folderIndex = -1
            // 遍历所有书籍同时找到文件夹所在index
            draft.forEach((item, index) => {
              if (item.type === ShelfItemTypeEnum.BOOK) {
                if (item.parents.includes(payload.id)) {
                  // 放回根文件夹
                  item.parents = []
                  // 更新index，不然index会出现重复
                  item.index = ++currentMaxIndex
                }
              } else if (item.type === ShelfItemTypeEnum.FOLDER && item.id === payload.id) {
                folderIndex = index
              }
            })

            // 校验一次index
            if (folderIndex === -1) {
              // 错误的id，没有这个文件夹，提示
              Notify.create({
                type: 'negative',
                timeout: 1500,
                position: 'bottom',
                message: '文件夹ID无效，请联系开发者'
              })
              return
            }

            // 删除文件夹
            draft.splice(folderIndex, 1)
          })
        )
      })
    },
    /** 保存修改 */
    async submitChange() {
      this.clearSelected()
      this.merge({ to: ShelfBranch.main })
      this.checkout({ to: ShelfBranch.main })
      await this.push({ syncRetome: true })
    }

    /** actions end */
  }
})

/** @public 书架store */
export function useShelfStore() {
  const store = shelfStore()

  // 第一次使用的时候，自动读取一次DB，避免每次使用store都要注意init
  if (!store.initialized && !store.useLoading().value) {
    store
      // 先从缓存读出来，展示在界面
      .pull()
      // 缓存读取之后就写入store，标记已经初始化完成
      .then(() => store.$patch({ initialized: true }))
      // 从服务器更新一次
      .then(() => store.syncFromRemote())
      // 服务器有返回的话，就整理一次（本地的缓存不需要再整理了
      .then(() => {
        const currentData = toRaw(store.shelf)
        const nextData = store.squeezeShelfItemIndex(currentData)

        const hasChange = currentData !== nextData

        if (hasChange) {
          store.commit({ shelf: nextData })
        }

        return hasChange
      })
      // 根据整理结果决定是否需要触发服务器保存（没变也需要保存一次本地，防止本地与服务器不同步
      .then(async (hasChange) => {
        await store.push({ syncRetome: hasChange })
      })
  }

  return store
}
