import { defineStore } from 'pinia'
import { toRaw } from 'vue'

import { Dark } from '@/utils/dark'
import { userSettingDB } from '@/utils/storage/db'

export interface GeneralSetting {
  globalWidth: number
  ignoreJapanese: boolean
  ignoreAI: boolean
}

export interface ReadSetting {
  fontSize: number
  readMode: 'scroll' | 'flip'
  bgType: 'none' | 'paper' | 'custom'
  customColor: string
  convert: null | 't2s' | 's2t'
  widthType: 'full' | 'medium' | 'small' | 'custom'
  readPageWidth: number
  justify: boolean
  firstLineIndent: boolean
  showButton: boolean
  tapToScroll: boolean
  hideFullScreen: boolean
}

export interface EditorSetting {
  mode: 'html' | 'markdown'
}

interface SettingState {
  isInit: boolean
  dark: 'auto' | boolean
  generalSetting: GeneralSetting
  readSetting: ReadSetting
  editorSetting: EditorSetting
  activeEditorMode: EditorSetting['mode']
}

type PersistentSettingKey = 'generalSetting' | 'readSetting' | 'editorSetting'
const PERSISTENT_SETTING_KEYS: PersistentSettingKey[] = ['generalSetting', 'readSetting', 'editorSetting']

function mergeKnownProperties<Setting extends object>(target: Setting, stored: Record<string, unknown> | null): void {
  if (!stored) return

  for (const key of Object.keys(target) as Array<keyof Setting>) {
    if (key in stored) target[key] = stored[key as string] as Setting[typeof key]
  }
}

export const useSettingStore = defineStore('app.setting', {
  state: (): SettingState => ({
    isInit: false,
    dark: Dark.get(),
    generalSetting: {
      globalWidth: 100,
      ignoreJapanese: false,
      ignoreAI: false,
    },
    readSetting: {
      fontSize: 16,
      readMode: 'scroll',
      bgType: 'none',
      customColor: '#000000',
      convert: null,
      widthType: 'full',
      readPageWidth: 0,
      justify: false,
      firstLineIndent: true,
      showButton: true,
      tapToScroll: false,
      hideFullScreen: false,
    },
    editorSetting: {
      mode: 'markdown',
    },
    activeEditorMode: 'markdown',
  }),
  actions: {
    async init(): Promise<void> {
      if (this.isInit) return

      try {
        await Promise.all(
          PERSISTENT_SETTING_KEYS.map(async (key) => {
            mergeKnownProperties(this[key], await userSettingDB.get(key))
          }),
        )
        this.activeEditorMode = this.editorSetting.mode
      } finally {
        this.isInit = true
      }
    },
    async save(): Promise<void> {
      await Promise.all(PERSISTENT_SETTING_KEYS.map((key) => userSettingDB.set(key, toRaw(this[key]))))
    },
  },
  getters: {
    buildReaderWidth(): string {
      if (this.readSetting.widthType === 'full') return '100%'
      if (this.readSetting.widthType === 'medium') return '75%'
      if (this.readSetting.widthType === 'small') return '50%'
      return `${this.readSetting.readPageWidth}px`
    },
    getGlobalWidth(): string {
      return `${this.generalSetting.globalWidth}%`
    },
  },
})
