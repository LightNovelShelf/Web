import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: 'lightnovel.life',
    value: 'https://api.lightnovel.life'
  },
  {
    label: 'lightnovel.life (临时)',
    value: 'https://api-2.lightnovel.life'
  }
]

if (__DEV__) {
  apiServerOptions.unshift({
    label: '开发服务器',
    value: 'http://localhost:5000'
  })
}

const apiServer = useStorage((VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server_V4', apiServerOptions[0].value)

export { apiServer, apiServerOptions }
