import { defineStore } from 'pinia'
import { useAppStore } from './index'
import { BookListResult, MessageModel } from '@/store/result'
const appStore = useAppStore()

export const useBookStore = defineStore('app.book', {
  state() {
    return { count: 0 }
  },
  actions: {
    // 获取书籍列表
    getBookList(page: number): Promise<MessageModel<BookListResult>> {
      return appStore.invokeWait('GetBookList', page)
    },
    // 获取书籍信息，参数是书籍id
    getBookInfo(bid: number) {
      return appStore.invokeWait('GetBookInfo', bid)
    }
  }
})
