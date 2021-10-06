import { defineStore } from 'pinia'

export const useBookStore = defineStore('app.book', {
  state() {
    return { count: 0 }
  },
  actions: {}
})
