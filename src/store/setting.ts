import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { userSettingDB } from '@/utils/storage/db'

export const useSettingStore = defineStore('app.setting', {
  state: () => ({
    isInit: true,
    dark: 'auto' as boolean | 'auto',
    readSetting: {
      fontSize: 16,
      bgType: 'none' as 'none' | 'paper' | 'custom',
      customColor: '#000000'
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
      const dark = await userSettingDB.get('dark')
      if (dark === 'auto' || typeof dark === 'boolean') this.dark = dark
      this.isInit = false
    },
    async save() {
      const p1 = userSettingDB.set('dark', this.dark)
      const p2 = userSettingDB.set('readSetting', toRaw(this.readSetting))
      await Promise.all([p1, p2])
    }
  }
})
