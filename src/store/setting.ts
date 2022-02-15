import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { userSettingDB } from '@/utils/storage/db'
import { Dark } from '@/plugins/quasar/dark'

export const useSettingStore = defineStore('app.setting', {
  state: () => ({
    isInit: true,
    dark: Dark.get(), // dark 设置不保存到服务器
    generalSetting: {
      enableBlurHash: true
    },
    readSetting: {
      fontSize: 16,
      bgType: 'none' as 'none' | 'paper' | 'custom',
      customColor: '#000000',
      convert: null as null | 't2s' | 's2t',
      readPageWidth: 0,
      justify: false,
      showButton: true,
      tapToScroll: false
    },
    editorSetting: {
      mode: 'html' as 'html' | 'markdown'
    }
  }),
  actions: {
    async init() {
      const p = []
      const keys = ['readSetting', 'editorSetting', 'generalSetting']
      keys.forEach((key) => {
        p.push(
          (async () => {
            const setting = await userSettingDB.get(key)
            if (setting) {
              Object.keys(setting).forEach((_key) => {
                this[key][_key] = setting[_key]
              })
            }
          })()
        )
      })
      await Promise.all(p)
    },
    async save() {
      const p = []
      const keys = ['readSetting', 'editorSetting', 'generalSetting']
      keys.forEach((key) => {
        p.push(userSettingDB.set(key, toRaw(this[key])))
      })
      await Promise.all(p)
      Dark.set(this.dark)
    }
  },
  getters: {
    buildReaderWidth(): string {
      if (this.readSetting.readPageWidth === 0) return '100%'
      return this.readSetting.readPageWidth + 'px'
    }
  }
})
