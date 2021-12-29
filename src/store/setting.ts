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
      readPageWidth: 0
    }
  }),
  actions: {
    async init() {
      const readSetting = (await userSettingDB.get('readSetting')) as Record<string, unknown>
      if (readSetting) {
        Object.keys(readSetting).forEach((key) => {
          this.readSetting[key] = readSetting[key]
        })
      }
    },
    async save() {
      const p1 = userSettingDB.set('readSetting', toRaw(this.readSetting))
      await Promise.all([p1])
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
