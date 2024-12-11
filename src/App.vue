<template>
  <q-layout view="hHh LpR fFf" :class="$q.dark.isActive ? '' : 'bg-grey-1'">
    <app-header />
    <app-side />
    <app-container />
  </q-layout>
</template>

<script lang="ts" setup>
import { AppSide, AppHeader, AppContainer } from 'src/components/app/index'
import { useQuasar } from 'quasar'
import { useServerNotify } from 'src/services/utils/useServerNotify'
import sanitizerHtml from 'src/utils/sanitizeHtml'
import { useSettingStore } from 'src/stores/setting'
import { useAppStore } from 'stores/app'
import { longTermToken } from 'src/utils/session'
import { getMyInfo } from 'src/services/user'
import { NOOP } from 'src/const/empty'
import 'overlayscrollbars/styles/overlayscrollbars.css'
import { OverlayScrollbars } from 'overlayscrollbars'
import { onMounted } from 'vue'

const $q = useQuasar()

$q.loadingBar.setDefaults({
  color: 'purple',
  size: '2px',
  position: 'top',
})

const appStore = useAppStore()
const settingStore = useSettingStore()
settingStore.init()

useServerNotify('OnMessage', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    message: sanitizerHtml(message),
    timeout: 2500,
    actions: [{ label: '关闭', color: 'white', handler: NOOP }],
  })
})

useServerNotify('OnError', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    type: 'negative',
    message: sanitizerHtml(message),
    timeout: 5000,
    actions: [{ label: '关闭', color: 'white', handler: NOOP }],
  })
})

useServerNotify('OnSuccess', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    type: 'positive',
    message: sanitizerHtml(message),
    timeout: 5000,
    actions: [{ label: '关闭', color: 'white', handler: NOOP }],
  })
})

const getUser = async () => {
  const token = await longTermToken.get()
  if (token) {
    appStore.user = await getMyInfo()
  }
}
getUser()

const color = computed(() => ($q.dark.isActive ? '#263238' : '#1976D2'))

watchEffect(() => {
  const metaThemeColor = document.querySelector('meta[name=theme-color]')
  metaThemeColor?.setAttribute('content', color.value)
})

onMounted(() => {
  const bodyElement = document.querySelector('body')
  if (!bodyElement) return
  const osInstance = OverlayScrollbars(
    {
      target: bodyElement,
      cancel: {
        nativeScrollbarsOverlaid: true,
      },
    },
    {
      scrollbars: {
        theme: 'scrollbar-base scrollbar-auto',
        autoHide: 'move',
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    },
  )
})
</script>

<style lang="scss"></style>
