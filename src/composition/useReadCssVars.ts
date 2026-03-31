import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useSettingStore } from 'stores/setting'

export function useReadCssVars() {
  const settingStore = useSettingStore()
  const { readSetting } = storeToRefs(settingStore)

  const readCssVars = computed(() => {
    const setting = readSetting.value
    return {
      '--read-font-size': `${setting.fontSize}px`,
      '--read-line-height': `${setting.lineHeight}`,
      '--read-paragraph-spacing': `${setting.paragraphSpacing}em`,
      '--read-paragraph-indent': `${setting.paragraphIndent}em`,
      '--read-letter-spacing': `${setting.letterSpacing}em`,
    }
  })

  return {
    readCssVars,
  }
}
