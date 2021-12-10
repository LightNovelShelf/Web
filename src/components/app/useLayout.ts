import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('app.layout', {
  state: () => ({
    siderShow: false,
    headerHeight: 58,
    containerStyle: {
      padding: '12px'
    }
  }),
  actions: {}
})
