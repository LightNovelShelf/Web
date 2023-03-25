import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: '(HK 被污染) api.lightnovel.app',
    value: 'https://api.lightnovel.app:45122'
  },
  {
    label: '(CloudFlare) api.lightnovel.life',
    value: 'https://api.lightnovel.life'
  }
]

const apiServer = useStorage((VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server', apiServerOptions[0].value)

export { apiServer, apiServerOptions }
