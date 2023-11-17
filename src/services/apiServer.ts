import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: 'lightnovel.life',
    value: 'https://api-hk.lightnovel.life:45122'
  },
  {
    label: 'ln.0s.hk (Fastly)',
    value: 'https://ln.0s.hk'
  },
  {
    label: 'lightnovel.life (CloudFlare)',
    value: 'https://api.lightnovel.life'
  },
  {
    label: 'lightnovel.app (被污染)',
    value: 'https://api.lightnovel.app:45122'
  }
]

if (__DEV__) {
  apiServerOptions.unshift({
    label: '开发服务器',
    value: 'http://localhost:5000'
  })
}

const apiServer = useStorage((VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server_V1', apiServerOptions[0].value)

export { apiServer, apiServerOptions }
