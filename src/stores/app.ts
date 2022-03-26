// store name命名约定：

// 全局store以`app.`开头，紧接文件名；文件夹嵌套以`.`分隔:
// @/store/user.ts => 'app.user'
// @/store/demo.ts => 'app.demo'
// @/store/demo/sub.ts => 'app.demo.sub'

// 局部页面 store name以`page.`开头，紧接所在文件夹名称
// 单文件命名`store.ts`, 多文件则以业务命名,

// @/page/book/store.ts => 'page.book'
// @/page/demo/store.ts => 'page.demo'
// @/page/demo/store/sub1.ts => 'page.demo.sub1'

import { defineStore } from 'pinia'

/** @url https://pinia.esm.dev/getting-started.html */

/** 全局store，命名导出的好处是可以有代码提示 */
export const useAppStore = defineStore('app', {
  state: () => ({
    appName: '轻书架',
    user: null as any
  }),
  getters: {
    doubleRepeat: (state) => state.appName.repeat(2),
    tripleRepeat: function (state) {
      return state.appName.repeat(2)
    },
    // 要取值getters，需要写成非箭头函数且标注返回值类型
    sum(): string {
      return `${this.appName} ${new Date().getFullYear()} ${this.doubleRepeat}`
    },
    userId(): number {
      return this.user?.Id
    },
    avatar(): string {
      return this.user?.Avatar
    }
  },
  actions: {
    reverse() {
      this.appName = this.appName.split('').reverse().join('')
      console.log('this.appName', this.appName)
    },

    async asyncReverse() {
      await Promise.resolve()
      this.reverse()
    }
  }
})
