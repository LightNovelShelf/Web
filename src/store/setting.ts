import { defineStore } from 'pinia'
import { DB } from '@/utils/storage/db'
import { toRaw } from 'vue'
import { DB_NAME } from '@/const/db'
import { Dark } from '@/plugins/quasar/dark'

/** 用来储存设置的DB */
const settingDB = new DB(DB_NAME.USER_SETTING, '设置缓存')

export const useSettingStore = defineStore('app.setting', {
  state: () => ({
    isInit: true,
    dark: Dark.get(), // dark 设置不保存到服务器
    readSetting: {
      fontSize: 16,
      bgType: 'none' as 'none' | 'paper' | 'custom',
      customColor: '#000000'
    }
  }),
  actions: {
    async init() {
      const readSetting = (await settingDB.get('readSetting')) as Record<string, unknown>
      if (readSetting) {
        Object.keys(readSetting).forEach((key) => {
          this.readSetting[key] = readSetting[key]
        })
      }
      this.isInit = false
    },
    async save() {
      const p1 = settingDB.set('readSetting', toRaw(this.readSetting))
      await Promise.all([p1])
      Dark.set(this.dark)
    }
  }
})
