import { defineStore } from 'pinia'

export const useChapterStore = defineStore('app.chapter', {
  state() {
    return { count: 0 }
  },
  actions: {}
})
