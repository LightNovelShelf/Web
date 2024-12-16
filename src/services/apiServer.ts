import { useStorage } from '@vueuse/core'

// 第一个就是默认的
const apiServerOptions = [
  {
    label: 'lightnovel.life',
    value: 'https://api.lightnovel.life',
  },
]

if (process.env.DEV) {
  apiServerOptions.unshift({
    label: '开发服务器',
    value: 'http://localhost:5000',
  })
}

const apiServer = useStorage(
  (process.env.VUE_APP_NAME || 'LightNovelShelf') + '_Api_Server_V5',
  apiServerOptions[0].value,
)

export { apiServer, apiServerOptions }
