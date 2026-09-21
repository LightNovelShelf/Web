import { produce } from 'immer'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { toRaw } from 'vue'

import { shelfDB, shelfStructVerDB } from '@/utils/storage/db'

import { getBookShelfBinary, saveBookShelf } from '@/services/user'
import { ROOT_LEVEL_FOLDER_NAME, ShelfItemTypeEnum, SHELF_STRUCT_VER_LATEST } from '@/types/shelf'

import type { ShelfItem, ShelfBookItem, ShelfFolderItem, SHELF_STRUCT_VER } from '@/types/shelf'

export enum ShelfBranch {
  main = 'main',
  draft = 'draft',
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

function createInitialState(): ShelfStore {
  return {
    initialized: false,
    selected: new Set(),
    source: {
      [ShelfBranch.main]: [],
      [ShelfBranch.draft]: [],
    },
    branch: ShelfBranch.main,
  }
}
const ROOT_PARENT_KEY = ''

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

function sort(shelf: ShelfItem[]): ShelfItem[] {
  return [...toRaw(shelf)].sort(ascSorter)
}

/** 返回数组中最后一个元素; 数组长度为零时返回null */
function lastItem<T>(arr: T[]): T | null {
  return arr[arr.length - 1] ?? null
}

function notifyError(message: string) {
  Notify.create({ type: 'negative', timeout: 1500, position: 'bottom', message })
}

/** 两条文件夹路径是否相同 */
export function isSameFolderPath(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

/** @private 书架store */
const shelfStore = defineStore('app.shelf', {
  state: createInitialState,
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
    /** 文件夹ID到文件夹的映射 */
    folderMap(): Map<string, ShelfFolderItem> {
      return new Map(this.folders.map((folder) => [folder.id, folder]))
    },
    /**
     * 解析文件夹路径，返回路径上每一层的文件夹
     *
     * 路径里有不存在的ID、或者父子关系对不上（比如文件夹被删后的旧URL）时返回null
     */
    resolveFolderPath(): (parents: string[]) => ShelfFolderItem[] | null {
      return (parents) => {
        const path: ShelfFolderItem[] = []
        for (const [depth, id] of parents.entries()) {
          const folder = this.folderMap.get(id)
          if (!folder || !isSameFolderPath(folder.parents, parents.slice(0, depth))) return null
          path.push(folder)
        }
        return path
      }
    },
    /** 文件夹内的全部书籍，含所有下级文件夹里的 */
    booksInFolderTree(): (id: string) => ShelfBookItem[] {
      return (id) => this.books.filter((book) => book.parents.includes(id))
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
        return toRaw(this.shelf).filter((i) => isSameFolderPath(i.parents, _parents))
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
    /** 选中计数 */
    selectedCount(): number {
      return this.selected.size
    },
    /** 选中的书籍 */
    selectedBooks(): ShelfBookItem[] {
      return this.shelf.filter(
        (i): i is ShelfBookItem => !!(i.type === ShelfItemTypeEnum.BOOK && this.selected.has(i.id)),
      )
    },
  },
  actions: {
    /** git ------------ */
    /** 从db中拉数据 */
    async fetch(): Promise<ShelfItem[]> {
      return this.squeezeShelfItemIndex(await shelfDB.getItems())
    },

    /** push到db */
    async push(config: { syncRemote?: boolean } = {}) {
      /** 记录的时候结构一定是最新的 */
      await shelfStructVerDB.set('VER', SHELF_STRUCT_VER_LATEST)

      this.commit({
        shelf: this.squeezeShelfItemIndex(toRaw(this.shelf)),
      })

      // 先把db内容清空，不然source中删除的项目，没法把删除的这个操作，同步到db中
      await shelfDB.clear()

      await Promise.all(this.shelf.map((item) => shelfDB.set(String(item.id), item)))

      if (config.syncRemote) {
        await this.syncToRemote()
      }
    },

    /** 切换分支 */
    checkout({ to: branch, reset = false }: { to: ShelfBranch; reset?: boolean }) {
      if (reset) {
        this.source[branch] = [...this.source[this.branch]]
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
      if (structVer !== SHELF_STRUCT_VER_LATEST) {
        this.commit({ shelf: [] })
        return
      }

      this.commit({ shelf })
    },

    /** git end -------- */

    /**
     * 从服务器同步，返回服务器上的数据是否被改写过
     *
     * 改写只有 index 挤压一种来源，没发生时不需要回写服务器
     */
    async syncFromRemote(): Promise<boolean> {
      const serve = await getBookShelfBinary()
      const shelf = serve.data

      const normalized = this.squeezeShelfItemIndex(shelf)
      this.commit({ shelf: normalized })
      // squeeze 走 immer，没改到的项目会保持原引用，逐项比引用就能判断有没有真的变化
      return normalized.length !== shelf.length || normalized.some((item, i) => item !== shelf[i])
    },
    /** 同步到服务器 */
    async syncToRemote() {
      await saveBookShelf({ data: toRaw(this.shelf), ver: SHELF_STRUCT_VER_LATEST })
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
      return produce(sort(curShelf), (draft) => {
        const nextIndexByParent = new Map<string, number>()
        for (const item of draft) {
          const parentId = lastItem(item.parents) ?? ROOT_PARENT_KEY
          item.index = (nextIndexByParent.get(parentId) ?? -1) + 1
          nextIndexByParent.set(parentId, item.index)
        }
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
        updateAt: new Date().toISOString(),
      }
      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const existing of draft) {
            if (existing.parents.length === 0) existing.index += 1
          }
          draft.unshift(item)
        }),
      })
      await this.push({ syncRemote: true })
    },
    /** 移出书架；传入文件夹ID时，文件夹内所有下级内容一并移出 */
    async removeFromShelf(payload: { books: (string | number)[]; push: boolean }) {
      const items = new Set(payload.books)

      this.commit({
        // 移出后index就会出现空洞，squeeze一次
        shelf: this.squeezeShelfItemIndex(
          // 删除项目
          produce(toRaw(this.shelf), (draft) =>
            draft.filter((i) => !items.has(i.id) && !i.parents.some((parent) => items.has(parent))),
          ),
        ),
      })

      // 如果标记为立即push（比如 详请页 移出收藏 场景）
      if (payload.push) {
        await this.push({ syncRemote: true })
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
              if (!isSameFolderPath(item.parents, parents)) {
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
          }),
        ),
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
    /**
     * 把项目移动到指定文件夹路径，返回实际移动的项目数
     *
     * parents存的是从根到父级的完整路径，所以移动文件夹时，它下级所有项目的路径前缀都要跟着重写
     */
    moveItems(payload: { ids: (string | number)[]; parents: string[] }): number {
      const shelf = toRaw(this.shelf)
      const requested = new Set(payload.ids)
      const requestedFolders = new Set(payload.ids.filter((id): id is string => typeof id === 'string'))
      const moving = new Set<string | number>()
      let blocked = 0

      for (const item of shelf) {
        if (!requested.has(item.id)) continue
        // 已经在目标文件夹里
        if (isSameFolderPath(item.parents, payload.parents)) continue
        // 祖先也在移动列表里，跟着祖先一起走
        if (item.parents.some((parent) => requestedFolders.has(parent))) continue
        // 目标路径经过这个文件夹自己，移进去会把它自己从树上摘下来
        if (payload.parents.includes(String(item.id))) {
          blocked += 1
          continue
        }
        moving.add(item.id)
      }

      if (blocked) notifyError('不能把文件夹移动到它自己或它的下级里')
      if (!moving.size) return 0

      const count = moving.size
      this.commit({
        shelf: this.squeezeShelfItemIndex(
          produce(shelf, (draft) => {
            // 移动过来的项目排在目标文件夹开头，彼此之间保持原来的先后顺序
            let nextIndex = 0
            for (const item of draft) {
              if (moving.has(item.id)) {
                item.parents = [...payload.parents]
                item.index = nextIndex++
              } else if (isSameFolderPath(item.parents, payload.parents)) {
                item.index += count
              }
            }

            // 重写被移动文件夹下级的路径前缀
            for (const item of draft) {
              if (moving.has(item.id)) continue
              const anchor = item.parents.findIndex((parent) => moving.has(parent))
              if (anchor === -1) continue
              item.parents = [...payload.parents, ...item.parents.slice(anchor)]
            }
          }),
        ),
      })

      // 清掉选择状态，不然会导致数据一直认为有已选的项目
      this.clearSelected()
      return count
    },
    /** 在指定路径下新建文件夹, 返回文件夹ID；失败时返回空字符串 */
    createFolder(payload: { name: string; parents?: string[] }): string {
      const name = payload.name.trim()
      const parents = payload.parents ?? []

      if (!name || name === ROOT_LEVEL_FOLDER_NAME) {
        notifyError('该文件夹名字无效')
        return ''
      }

      // 只跟同一层的文件夹校验重名
      for (const folder of this.folders) {
        if (folder.title === name && isSameFolderPath(folder.parents, parents)) {
          notifyError('这一层已有同名文件夹')
          return ''
        }
      }

      const folderID = nanoid()

      /** 新的文件夹 */
      const folder: ShelfFolderItem = {
        // 固定在第一
        index: 0,
        type: ShelfItemTypeEnum.FOLDER,
        parents: [...parents],
        id: folderID,
        title: name,
        updateAt: new Date().toISOString(),
      }

      this.commit({
        shelf: this.squeezeShelfItemIndex(
          produce(toRaw(this.shelf), (draft) => {
            for (const item of draft) {
              if (isSameFolderPath(item.parents, parents)) item.index += 1
            }
            draft.unshift(folder)
          }),
        ),
      })

      return folderID
    },
    /** 重命名文件夹，返回是否改名成功 */
    renameFolder(payload: { name: string; id: string }): boolean {
      const name = payload.name.trim()
      const folder = this.folderMap.get(payload.id)

      if (!folder) {
        notifyError('文件夹ID无效，请联系开发者')
        return false
      }
      if (!name || name === ROOT_LEVEL_FOLDER_NAME) {
        notifyError('该文件夹名字无效')
        return false
      }
      for (const other of this.folders) {
        if (other.id !== folder.id && other.title === name && isSameFolderPath(other.parents, folder.parents)) {
          notifyError('这一层已有同名文件夹')
          return false
        }
      }

      this.commit({
        shelf: produce(toRaw(this.shelf), (draft) => {
          for (const item of draft) {
            if (item.type === ShelfItemTypeEnum.FOLDER && item.id === payload.id) {
              item.title = name
              return
            }
          }
        }),
      })
      return true
    },
    /** 删除文件夹，内容提升到它所在的上一层 */
    deleteFolder(payload: { id: string }) {
      const folder = this.folderMap.get(payload.id)
      if (!folder) {
        notifyError('文件夹ID无效，请联系开发者')
        return
      }
      const parents = folder.parents

      this.commit({
        shelf: this.squeezeShelfItemIndex(
          produce(toRaw(this.shelf), (draft) => {
            // 提升上来的内容排在上一层末尾
            let nextIndex = this.curMaxIndexInFolder(lastItem(parents)) + 1

            for (const item of draft) {
              const depth = item.parents.indexOf(payload.id)
              if (depth === -1) continue

              // 从路径里摘掉这个文件夹，更深层的层级关系保持不变
              const isDirectChild = depth === item.parents.length - 1
              item.parents = [...item.parents.slice(0, depth), ...item.parents.slice(depth + 1)]
              if (isDirectChild) item.index = nextIndex++
            }

            const folderIndex = draft.findIndex((item) => item.id === payload.id)
            draft.splice(folderIndex, 1)
          }),
        ),
      })
    },
    /** 保存修改 */
    async submitChange() {
      this.clearSelected()
      this.merge({ to: ShelfBranch.main })
      this.checkout({ to: ShelfBranch.main })
      await this.push({ syncRemote: true })
    },
    async initialize() {
      try {
        await this.pull()
      } catch {
        this.commit({ shelf: [] })
      }
      this.initialized = true

      const changed = await this.syncFromRemote()
      await this.push({ syncRemote: changed })
    },

    /** actions end */
  },
})

/** @public 书架store */
export function useShelfStore() {
  const store = shelfStore()
  if (!store.initialized && !store.useLoading().value) {
    void store.initialize().catch(() => undefined)
  }
  return store
}
