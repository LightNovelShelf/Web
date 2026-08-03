<template>
  <q-layout view="hHh LpR fFf" :class="[$q.dark.isActive ? '' : 'bg-grey-1', { 'immersive-layout': isImmersiveRoute }]">
    <app-header v-if="!isImmersiveRoute" />
    <app-side v-if="!isImmersiveRoute" />
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
import type { Growth } from 'src/services/points'

import 'overlayscrollbars/overlayscrollbars.css'

const $q = useQuasar()
const route = useRoute()
const isImmersiveRoute = computed(() => route.meta.immersive === true)

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

// 经验/金币变动时后端主动推送最新成长摘要，直接更新本地 user，无需重新拉 info
useServerNotify<Growth>('OnGrowthUpdate', (growth) => {
  if (!appStore.user || !growth) return
  const expDelta = growth.Exp - (appStore.user.Growth?.Exp ?? growth.Exp)
  const coinDelta = growth.Coin - (appStore.user.Growth?.Coin ?? growth.Coin)
  appStore.user.Growth = growth
  appStore.user.Level = growth.Level

  // 一次动作可能同时变动两者，合并成一条提示
  const parts: string[] = []
  if (expDelta !== 0) parts.push(`经验 ${expDelta > 0 ? '+' : ''}${expDelta}`)
  if (coinDelta !== 0) parts.push(`金币 ${coinDelta > 0 ? '+' : ''}${coinDelta}`)
  if (parts.length) {
    $q.notify({
      position: 'top',
      type: expDelta + coinDelta > 0 ? 'positive' : 'warning',
      message: parts.join('，'),
      timeout: 2000,
    })
  }
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
