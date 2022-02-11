import { defineStore } from 'pinia'
import { BookInList } from '@/services/book/types'
import { getBookListByIds } from '@/services/book'

export interface ShelfStore {
  data: Map<number, BookInList>
  /** 待查询id队列 */
  pending: Set<number>
  /** 延时查询context */
  schemeContext: number
}

/** 初始state */
const INIT: ShelfStore = {
  data: new Map(),
  pending: new Set(),
  schemeContext: 0
}

// function EMPTY_BOOK(Title = ''): BookInList {
//   return {
//     Id: -1,
//     Cover: '',
//     LastUpdateTime: new Date(0),
//     UserName: '',
//     Title,
//     Level: 1,
//     InteriorLevel: 1
//   }
// }

class EMPTY_BOOK implements BookInList {
  constructor(public readonly Title = '') {}

  public readonly Id = -1
  public readonly Cover = ''
  public readonly LastUpdateTime = new Date(0)
  public readonly UserName = ''
  public readonly Level = 1
  public readonly InteriorLevel = 1
}

/**
 * 书籍列表数据
 *
 * @description
 * 用作列表查询store
 */
export const usebookListStore = defineStore('app.bookListData', {
  state: () => INIT,
  getters: {
    getBook() {
      return (id: number, title?: string): BookInList => {
        return this.data.get(id) || new EMPTY_BOOK(title)
      }
    },
    isEmpty() {
      return (book: BookInList): boolean => {
        return book instanceof EMPTY_BOOK
      }
    }
  },
  actions: {
    /** @public 添加查询 */
    queryBooks(payload: { ids: number[]; force?: boolean }): void {
      for (const id of payload.ids) {
        // 如果data已经有了且不force
        if (!payload.force && this.data.has(id)) {
          // 就跳过
          continue
        }

        // 否则add进pending
        this.pending.add(id)
      }
      this._schemeQueryAction()
    },
    /** @private 排期查询 */
    _schemeQueryAction(): void {
      // 如果已经有异步了，不用干别的，等就行了
      if (this.schemeContext) {
        return
      }

      this.schemeContext = requestAnimationFrame(() => this._startQuery())
    },
    /** @private 查询 */
    async _startQuery(): Promise<void> {
      this.schemeContext = 0

      if (!this.pending.size) {
        return
      }

      // 把 pending 队列分成24个一组

      /** 最大值 */
      const MAX = getBookListByIds.MAX_CONCURRENT
      /** 组群 */
      const booksGroups: number[][] = []
      let cursor = 0

      for (const id of this.pending) {
        if (!booksGroups[cursor]) {
          booksGroups[cursor] = []
        } else if (booksGroups[cursor].length >= MAX) {
          booksGroups.push([])
          cursor += 1
        }

        booksGroups[cursor].push(id)
      }

      // 重置pengding队列
      this.pending = new Set()

      // 发出请求
      const res = await Promise.all(booksGroups.map((books) => getBookListByIds(books)))
    }
  }
})