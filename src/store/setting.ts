import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { userSettingDB } from '@/utils/storage/db'
import { Dark } from '@/plugins/quasar/dark'

export const useSettingStore = defineStore('app.setting', {
  state: () => ({
    isInit: true,
    dark: Dark.get(), // dark 设置不保存到服务器
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
      mode: 'html'
    }
  }),
  actions: {
    async init() {
      const readSetting = await userSettingDB.get('readSetting')
      const editorSetting = await userSettingDB.get('editorSetting')
      if (readSetting) {
        Object.keys(readSetting).forEach((key) => {
          this.readSetting[key] = readSetting[key]
        })
      }
      if (editorSetting) {
        Object.keys(editorSetting).forEach((key) => {
          this.editorSetting[key] = editorSetting[key]
        })
      }
    },
    async save() {
      const p1 = userSettingDB.set('readSetting', toRaw(this.readSetting))
      const p2 = userSettingDB.set('editorSetting', toRaw(this.editorSetting))
      await Promise.all([p1, p2])
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
