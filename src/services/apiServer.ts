import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: 'lightnovel.life',
    value: 'https://api.lightnovel.life'
  },
  {
    label: 'lightnovel.life (CloudFlare)',
    value: 'https://api-cf.lightnovel.life'
  }
]

if (__DEV__) {
  apiServerOptions.unshift({
    label: '开发服务器',
    value: 'http://localhost:5000'
  })
}

const apiServer = useStorage((VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server_V3', apiServerOptions[0].value)

export { apiServer, apiServerOptions }
