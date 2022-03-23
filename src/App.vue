<template>
  <q-layout view="hHh LpR fFf" :class="$q.dark.isActive ? '' : 'bg-grey-1'">
    <app-header />
    <app-sider />
    <app-container />
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, defineComponent, watchEffect } from 'vue'
import { AppSider, AppHeader, AppContainer } from 'src/components/app/index'
import { useQuasar } from 'quasar'
import { useServerNotify } from 'src/services/utils/useServerNotify'
import sanitizerHtml from 'src/utils/sanitizeHtml'
import { useSettingStore } from 'src/stores/setting'
import { useAppStore } from 'stores/app'
import { longTermToken } from 'src/utils/session'
import { getMyInfo } from 'src/services/user'
import { NOOP } from 'src/const/empty'

defineComponent({ AppSider, AppHeader, AppContainer })

const $q = useQuasar()
$q.loadingBar.setDefaults({
  color: 'purple',
  size: '2px',
  position: 'top'
})

const appStore = useAppStore()
const settingStore = useSettingStore()
settingStore.init()

// 字体设置
const style = document.createElement('style')
style.type = 'text/css'
style.id = 'read_style'
document.head.append(style)
useServerNotify('OnFontChange', (fontUrl: string) => {
  if (fontUrl) {
    if (!fontUrl.startsWith('http')) fontUrl = VUE_APP_API_SERVER + fontUrl
    style.innerHTML = `@font-face{font-family:read;font-display: block;src:url(${fontUrl});}`
  }
})

useServerNotify('OnMessage', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    message: sanitizerHtml(message),
    timeout: 2500,
    actions: [{ label: '关闭', color: 'white', handler: NOOP }]
  })
})

const getUser = async () => {
  const token = await longTermToken.get()
  if (token) {
    appStore.user = await getMyInfo()
  }
}
getUser()

let color = computed(() => ($q.dark.isActive ? '#263238' : '#1976D2'))

watchEffect(() => {
  let metaThemeColor = document.querySelector('meta[name=theme-color]')
  metaThemeColor?.setAttribute('content', color.value)
})
</script>

<style lang="scss" scoped></style>
