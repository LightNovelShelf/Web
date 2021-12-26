import { defineStore } from 'pinia'
import { ShelfBookItem, ShelfFolderItem, ShelfItem } from '@/types/shelf'
import { shelfBookDB, shelfFolderDB } from '@/utils/storage/db'

export interface ShelfStore {
  _first: boolean
  books: ShelfBookItem[]
  folder: ShelfFolderItem[]
}

/** 初始state */
const INIT: ShelfStore = {
  _first: true,
  books: [],
  folder: []
}

/** @private 书架store */
const shelfStore = defineStore('app.shelf', {
  state: () => INIT,
  getters: {
    shelf(state): ShelfItem[] {
      return state.books
    }
  },
  actions: {
    async readDB() {
      this.books = await shelfBookDB.getItems()
      this.folder = await shelfFolderDB.getItems()
    },
    async writeDB() {
      await shelfBookDB.clear()
      for (const i of this.books) {
        await shelfBookDB.set(i.Id, i)
      }

      await shelfFolderDB.clear()
      for (const i of this.folder) {
        await shelfFolderDB.set(i.Id, i)
      }
    }
  }
})

/** @public 书架store */
export function useShelfStore() {
  const instance = shelfStore()

  // 第一次使用的时候，自动读取一次DB，避免每次使用store都要注意init
  if (instance._first) {
    instance.$patch({ _first: false })
    instance.readDB()
  }

  return instance
}
