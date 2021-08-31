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
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { HubConnectionState } from '@microsoft/signalr/dist/esm/HubConnection'

/** @url https://pinia.esm.dev/getting-started.html */

/** 全局store，命名导出的好处是可以有代码提示 */
export const useAppStore = defineStore('app', {
  state: () => ({
    appName: '轻书架',
    connection: null as null | HubConnection
  }),
  getters: {
    doubleRepeat: (state) => state.appName.repeat(2),
    tripleRepeat: function (state) {
      return state.appName.repeat(2)
    },
    isConnected(state): boolean {
      return state.connection?.state === HubConnectionState.Connected
    },
    // 要取值getters，需要写成非箭头函数且标注返回值类型
    sum(): string {
      return `${this.appName} ${new Date().getFullYear()} ${this.doubleRepeat}`
    }
  },
  actions: {
    reverse() {
      this.appName = this.appName.split('').reverse().join('')
      console.log('this.appName', this.appName)
    },
    connectServer() {
      const connect = async () => {
        this.connection = new HubConnectionBuilder()
          .withUrl(`${process.env.VUE_APP_API_SERVER}/hub/api`)
          .withHubProtocol(new MessagePackHubProtocol())
          .configureLogging(LogLevel.Information)
          .build()

        try {
          this.connection.onclose(connect)
          await this.connection.start()
          console.log('SignalR Connected.')
        } catch (err) {
          console.log(err)
          setTimeout(connect, 5000)
        }
      }
      return connect()
    },
    invoke(name: string, ...arg: any[]): Promise<any> {
      if (this.connection && this.isConnected) {
        return this.connection.invoke(name, ...arg)
      }
      return Promise.resolve()
    },
    async asyncReverse() {
      await Promise.resolve()
      this.reverse()
    }
  }
})
