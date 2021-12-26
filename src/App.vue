<template>
  <q-layout view="hHh LpR fFf" :class="$q.dark.isActive ? '' : 'bg-grey-1'">
    <app-header />
    <app-sider />
    <app-container />
  </q-layout>
</template>

<script lang="tsx" setup>
import { defineComponent, watch } from 'vue'
import { AppSider, AppHeader, AppContainer } from '@/components/app/index'
import { useQuasar } from 'quasar'
import { useServerNotify } from '@/services/utils/useServerNotify'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { useSettingStore } from '@/store/setting'
import { useAppStore } from '@/store'
import { longTermToken } from '@/utils/session'
import { getMyInfo } from '@/services/user'
import { changeThemeColor } from '@/plugins/quasar/utils'

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

const getUser = async () => {
  const token = await longTermToken.get()
  if (token) {
    appStore.user = await getMyInfo()
  }
}
getUser()

// 字体设置
const style = document.createElement('style')
style.type = 'text/css'
style.id = 'read_style'
document.head.append(style)
watch(
  () => appStore.user?.Font,
  () => {
    let fontUrl = appStore.user?.Font
    if (fontUrl) {
      if (!fontUrl.startsWith('http')) fontUrl = VUE_APP_API_SERVER + fontUrl
      style.innerHTML = `@font-face{font-family:read;src:url(${fontUrl});}`
    }
  }
)

useServerNotify('OnMessage', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    message: sanitizerHtml(message),
    timeout: 2500
  })
})

watch(
  () => $q.dark.isActive,
  () => changeThemeColor($q.dark.isActive)
)
</script>

<style lang="scss" scoped></style>
