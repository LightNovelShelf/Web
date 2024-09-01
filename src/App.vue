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
  position: 'top'
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
    actions: [{ label: '关闭', color: 'white', handler: NOOP }]
  })
})

useServerNotify('OnError', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    type: 'negative',
    message: sanitizerHtml(message),
    timeout: 5000,
    actions: [{ label: '关闭', color: 'white', handler: NOOP }]
  })
})

useServerNotify('OnSuccess', (message: string) => {
  $q.notify({
    position: 'top',
    html: true,
    type: 'positive',
    message: sanitizerHtml(message),
    timeout: 5000,
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

onMounted(() => {
  const bodyElement = document.querySelector('body')
  if (!bodyElement) return
  const osInstance = OverlayScrollbars(
    {
      target: bodyElement,
      cancel: {
        nativeScrollbarsOverlaid: true
      }
    },
    {
      scrollbars: {
        theme: 'scrollbar-base scrollbar-dark',
        autoHide: 'move',
        autoHideDelay: 500,
        autoHideSuspend: false
      }
    }
  )
  console.log('hello body')
})
</script>

<style lang="scss">
:root {
  --scrollbar-bg-light: rgba(0, 0, 0, 0.4);
  --scrollbar-bg-hover-light: rgba(0, 0, 0, 0.5);
  --scrollbar-bg-active-light: rgba(0, 0, 0, 0.6);

  --scrollbar-bg-dark: rgba(255, 255, 255, 0.4);
  --scrollbar-bg-hover-dark: rgba(255, 255, 255, 0.5);
  --scrollbar-bg-active-dark: rgba(255, 255, 255, 0.6);

  --scrollbar-bg: var(--scrollbar-bg-light), var(--scrollbar-bg-dark);
  --scrollbar-bg-hover: var(--scrollbar-bg-hover-light), var(--scrollbar-bg-hover-dark);
  --scrollbar-bg-active: var(--scrollbar-bg-active-light), var(--scrollbar-bg-active-dark);
}

.scrollbar-base.os-scrollbar {
  padding-top: 0.5rem; /* 8px */
  padding-bottom: 0.5rem; /* 8px */
  transition: width 0.15s ease-in-out, height 0.15s ease-in-out, opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s,
    bottom 0.15s, left 0.15s;
  pointer-events: unset;

  &.os-scrollbar-horizontal {
    padding-top: 4px;
    padding-bottom: 4px;
    height: 16px;

    .os-scrollbar-track .os-scrollbar-handle {
      height: 4px;
      border-radius: 4px;
    }

    &:hover .os-scrollbar-track .os-scrollbar-handle {
      height: 8px;
    }

    &.px-2 {
      padding-left: 8px;
      padding-right: 8px;
    }
  }

  &.os-scrollbar-vertical {
    padding-left: 4px;
    padding-right: 4px;
    width: 16px;

    .os-scrollbar-track .os-scrollbar-handle {
      width: 4px;
      border-radius: 4px;
    }

    &:hover .os-scrollbar-track .os-scrollbar-handle {
      width: 8px;
    }

    &.py-1 {
      padding-top: 4px;
      padding-bottom: 4px;
    }
  }
}

.scrollbar-auto {
  &.os-scrollbar {
    --os-handle-bg: var(--scrollbar-bg);
    --os-handle-bg-hover: var(--scrollbar-bg-hover);
    --os-handle-bg-active: var(--scrollbar-bg-active);
  }
}

.scrollbar-dark {
  &.os-scrollbar {
    --os-handle-bg: var(--scrollbar-bg-dark);
    --os-handle-bg-hover: var(--scrollbar-bg-hover-dark);
    --os-handle-bg-active: var(--scrollbar-bg-active-dark);
  }
}

.scrollbar-light {
  &.os-scrollbar {
    --os-handle-bg: var(--scrollbar-bg-light);
    --os-handle-bg-hover: var(--scrollbar-bg-hover-light);
    --os-handle-bg-active: var(--scrollbar-bg-active-light);
  }
}
</style>
