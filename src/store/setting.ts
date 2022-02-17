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
      tapToScroll: false,
      hideFullScreen: false
    }
  }),
  actions: {
    async init() {
      const readSetting = await userSettingDB.get('readSetting')
      if (readSetting) {
        Object.keys(readSetting).forEach((key) => {
          this.readSetting[key] = readSetting[key]
        })
      }
      const generalSetting = await userSettingDB.get('generalSetting')
      if (generalSetting) {
        Object.keys(generalSetting).forEach((key) => {
          this.generalSetting[key] = generalSetting[key]
        })
      }
    },
    async save() {
      console.log('save')
      const p1 = userSettingDB.set('readSetting', toRaw(this.readSetting))
      const p2 = userSettingDB.set('generalSetting', toRaw(this.generalSetting))
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
