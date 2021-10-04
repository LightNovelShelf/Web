import { defineStore } from 'pinia'
import { useAppStore } from './index'
import { MessageModel } from '@/types/result'

export const useChapterStore = defineStore('app.chapter', {
  state() {
    return { count: 0 }
  },
  actions: {
    // 获取章节内容
    getChapterContent(bid: number, sortNum: number): Promise<MessageModel<any>> {
      const appStore = useAppStore()
      return appStore.invokeWait('GetChapterContent', bid, sortNum)
    }
  }
})
