import { defineStore } from 'pinia'
import { DB } from '@/utils/storage/db'
import { toRaw } from 'vue'

/** 用来储存设置的DB */
const settingDB = new DB('Setting', '设置缓存')

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
      const readSetting = await settingDB.get('readSetting')
      if (readSetting) {
        Object.keys(readSetting).forEach((key) => {
          this.readSetting[key] = readSetting[key]
        })
      }
      const dark = await settingDB.get('dark')
      if (dark === 'auto' || typeof dark === 'boolean') this.dark = dark
      this.isInit = false
    },
    async save() {
      const p1 = settingDB.set('dark', this.dark)
      const p2 = settingDB.set('readSetting', toRaw(this.readSetting))
      await Promise.all([p1, p2])
    }
  }
})
