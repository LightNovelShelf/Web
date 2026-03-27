<template>
  <q-layout view="hHh LpR fFf" :class="$q.dark.isActive ? '' : 'bg-grey-1'">
    <app-header />
    <app-side />
    <app-container v-if="settingStore.isInit" />
  </q-layout>
</template>

<script lang="ts" setup>
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'

import sanitizerHtml from 'src/utils/sanitizeHtml'
import { longTermToken, sessionToken } from 'src/utils/session'

import { useAppStore } from 'stores/app'
import { useSettingStore } from 'stores/setting'

import { AppSide, AppHeader, AppContainer } from 'components/app/index'

import { NOOP } from 'src/const/empty'
import { getMyInfo } from 'src/services/user'
import { useServerNotify } from 'src/services/utils/useServerNotify'

import type { UseOverlayScrollbarsParams } from 'overlayscrollbars-vue'

import 'overlayscrollbars/overlayscrollbars.css'

const $q = useQuasar()

$q.loadingBar.setDefaults({
  color: 'purple',
  size: '2px',
  position: 'top',
})

const appStore = useAppStore()
const settingStore = useSettingStore()
settingStore.init()
const isRefreshingUser = ref(false)
let pendingRefreshUser = false

useServerNotify('OnMessage', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    message: sanitizerHtml(message),
    timeout: 5000,
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

const refreshMyInfo = async () => {
  if (isRefreshingUser.value) {
    pendingRefreshUser = true
    return
  }

  if (!sessionToken.get() && !(await longTermToken.get())) {
    return
  }

  isRefreshingUser.value = true

  try {
    appStore.user = await getMyInfo()
  } catch {
    // 未授权和临时网络问题交给现有全局处理链路
  } finally {
    isRefreshingUser.value = false

    if (pendingRefreshUser) {
      pendingRefreshUser = false
      void refreshMyInfo()
    }
  }
}

useServerNotify('OnNotificationRefresh', () => {
  void refreshMyInfo()
})

const getUser = async () => {
  const token = await longTermToken.get()
  if (token) {
    await refreshMyInfo()
  }
}
getUser()

const color = computed(() => ($q.dark.isActive ? '#263238' : '#1976D2'))

watchEffect(() => {
  const metaThemeColor = document.querySelector('meta[name=theme-color]')
  metaThemeColor?.setAttribute('content', color.value)
})

const scrollbarParams = computed(
  (): UseOverlayScrollbarsParams => ({
    defer: true,
    options: {
      scrollbars: {
        theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
        autoHide: 'move',
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    },
  }),
)

const [initBodyOverlayScrollbars] = useOverlayScrollbars(scrollbarParams)
onMounted(() => {
  if ($q.platform.is.desktop) {
    initBodyOverlayScrollbars({
      target: document.body,
      cancel: {
        body: false,
      },
    })
  }
})
</script>

<style lang="scss"></style>
