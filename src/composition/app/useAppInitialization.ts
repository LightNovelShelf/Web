import { watchDebounced } from '@vueuse/core'
import { Dark as QuasarDark } from 'quasar'
import { onScopeDispose, watch } from 'vue'

import { Dark as persistedDark } from '@/utils/dark'

import { useSessionStore } from '@/stores/session'
import { useSettingStore } from '@/stores/setting'

import { useAppAppearance } from '@/composition/app/useAppAppearance'
import { useDirectMessageEvents } from '@/composition/app/useDirectMessageEvents'
import { useServerNotifications } from '@/composition/app/useServerNotifications'

import { NOOP } from '@/const/empty'
import { apiServer } from '@/services/apiServer'
import { restartRealtimeConnection } from '@/services/transport/realtime'

import type { WatchStopHandle } from 'vue'

export function useAppInitialization(): void {
  const sessionStore = useSessionStore()
  const settingStore = useSettingStore()

  useAppAppearance()
  useServerNotifications()
  useDirectMessageEvents()

  watch(
    () => settingStore.dark,
    (dark) => {
      QuasarDark.set(dark)
      persistedDark.set(dark)
    },
    { immediate: true },
  )

  let stopPersistence: WatchStopHandle | undefined
  let isActive = true
  void settingStore
    .init()
    .then(() => {
      if (!isActive) return
      stopPersistence = watchDebounced(
        () => [settingStore.generalSetting, settingStore.readSetting, settingStore.editorSetting],
        () => void settingStore.save(),
        { deep: true, debounce: 250, maxWait: 1_000 },
      )
    })
    .catch(NOOP)

  const stopServerWatcher = watch(apiServer, () => {
    void restartRealtimeConnection().catch(NOOP)
  })

  void sessionStore.restoreUser().catch(NOOP)

  onScopeDispose(() => {
    isActive = false
    stopPersistence?.()
    stopServerWatcher()
  })
}
