import { defineStore } from 'pinia'
import { useAppStore } from './index'

export const useBookStore = defineStore('app.book', {
  state() {
    return { count: 0 }
  },
  actions: {
    GetBookList(page: number, waitConnect = false) {
      const appStore = useAppStore()
      return appStore.invoke(waitConnect, 'GetBookList', page)
    }
  }
})
