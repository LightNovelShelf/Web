import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'
import { computed, onMounted, watchEffect } from 'vue'

import type { UseOverlayScrollbarsParams } from 'overlayscrollbars-vue'

import 'overlayscrollbars/overlayscrollbars.css'

export function useAppAppearance(): void {
  const quasar = useQuasar()
  quasar.loadingBar.setDefaults({ color: 'purple', size: '2px', position: 'top' })

  watchEffect(() => {
    const color = quasar.dark.isActive ? '#263238' : '#1976D2'
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', color)
  })

  const scrollbarParams = computed((): UseOverlayScrollbarsParams => ({
    defer: true,
    options: {
      scrollbars: {
        theme: quasar.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
        autoHide: 'move',
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    },
  }))
  const [initializeScrollbars] = useOverlayScrollbars(scrollbarParams)

  onMounted(() => {
    if (!quasar.platform.is.desktop) return
    initializeScrollbars({ target: document.body, cancel: { body: false } })
  })
}
