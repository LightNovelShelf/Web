import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: 'hk',
    value: 'https://api.lightnovel.life',
  },
  {
    label: 'cloudflare',
    value: 'https://cf-api.lightnovel.life',
  },
]

if (import.meta.env.QUASAR_DEV) {
  apiServerOptions.unshift({
    label: '开发服务器',
    value: 'http://localhost:5204',
  })
}

const apiServer = useStorage(
  (import.meta.env.VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server_V7',
  apiServerOptions[0].value,
)

export { apiServer, apiServerOptions }
