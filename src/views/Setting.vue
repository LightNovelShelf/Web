<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-tabs dense v-model="tab" class="text-teal">
        <template v-for="option in tabOptions" :key="option.key">
          <q-tab :name="option.name" :icon="option.icon" :label="option.label" />
        </template>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Setting">
          <div class="q-pa-md">
            <div class="q-gutter-sm light-radio">
              <div>网站模式</div>
              <q-radio v-model="dark" :val="false" label="明亮" />
              <q-radio v-model="dark" :val="true" label="夜间" />
              <q-radio v-model="dark" val="auto" label="自动" />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="Read">
          <div class="q-pa-md">
            <div class="q-gutter-sm bg-radio">
              <div>阅读背景</div>
              <q-radio v-model="readSetting.bgType" val="none" label="无" />
              <q-radio v-model="readSetting.bgType" val="paper" label="纸质" />
              <q-radio v-model="readSetting.bgType" val="custom" label="自定义颜色" />
            </div>
            <q-color
              style="max-width: 200px"
              v-if="readSetting.bgType === 'custom'"
              v-model="readSetting.customColor"
              class="my-picker"
            />
            <div class="q-gutter-sm">
              <div>文字转换</div>
              <q-radio v-model="readSetting.convert" :val="null" label="无" />
              <q-radio v-model="readSetting.convert" val="t2s" label="简化" />
              <q-radio v-model="readSetting.convert" val="s2t" label="繁化" />
            </div>
            <div>
              <div>其他选项</div>
              <q-toggle v-model="readSetting.justify" label="两端对齐" />
            </div>
            <div>
              <div>字体大小</div>
              <q-slider label v-model="readSetting.fontSize" :min="12" :max="30" />
            </div>
            <div class="q-gutter-sm">
              <div>阅读页宽度（设为 0 时为全屏，只在大屏幕下生效）</div>
              <div style="max-width: 150px">
                <q-input v-model.number="readSetting.readPageWidth" type="number" dense outlined>
                  <template v-slot:append>
                    <div>px</div>
                  </template>
                </q-input>
              </div>
              <!-- <div class="q-ma-md">预览</div>
              <div
                class="preview"
                :style="{
                  '--width': readSetting.readPageWidth === 0 ? '100%' : readSetting.readPageWidth + 'px'
                }"
              >
                <q-scroll-area style="height: 200px; width: 100%">
                  <div v-for="n in 100" :key="n" class="q-py-xs">
                    这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，
                    这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，
                    这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，
                    这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，这是一段预览文本，
                  </div>
                </q-scroll-area>
              </div> -->
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { watch, defineComponent, ref, onActivated } from 'vue'
import { icon } from '@/plugins/icon'
import { Dark } from 'quasar'
import { useSettingStore } from '@/store/setting'
import { storeToRefs } from 'pinia'

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Setting',
    key: 'Setting',
    label: '设置',
    icon: icon.mdiCog
  },
  {
    name: 'Read',
    key: 'Read',
    label: '阅读',
    icon: icon.mdiFormatSize
  }
]

export default defineComponent({
  name: 'Setting',
  setup() {
    const settingStore = useSettingStore()
    const { dark } = storeToRefs(settingStore)
    const readSetting = settingStore.readSetting

    let tab = ref('Setting')

    watch(dark, (newDark) => {
      Dark.set(newDark)
      settingStore.save()
    })

    watch(readSetting, () => {
      settingStore.save()
    })

    return {
      icon,
      tabOptions,
      tab,
      readSetting,
      dark
    }
  }
})
</script>

<style lang="scss">
.preview {
  @import 'src/styles/quasar.variables';

  @media screen and (min-width: $breakpoint-md-min) {
    width: var(--width);
    max-width: 100%;
    min-width: 300px;
  }
}
</style>
