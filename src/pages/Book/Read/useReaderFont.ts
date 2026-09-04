import { onUnmounted, watch } from 'vue'

import { apiServer } from '@/services/apiServer'

import type { Ref } from 'vue'

export function useReaderFont(font: Ref<string | undefined>, onReady: () => void): void {
  const style = document.createElement('style')
  document.head.append(style)

  const stop = watch(
    [font, apiServer],
    ([fontSource, server]) => {
      if (!fontSource) {
        style.textContent = ''
        return
      }

      const url = fontSource.startsWith('http') ? fontSource : `${server}${fontSource}`
      style.textContent = `@font-face{font-family:read;font-display:block;src:url(${JSON.stringify(url)});}`
      void document.fonts.ready.then(() => {
        if (font.value === fontSource) onReady()
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stop()
    style.remove()
  })
}
