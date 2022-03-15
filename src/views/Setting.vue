<template>
  <div class="q-pa-md" :style="`width: ${$q.screen.gt.md ? settingStore['getGlobalWidth'] : '100%'}`">
    <div class="q-gutter-y-md">
      <q-tabs dense v-model="tab" class="text-teal">
        <template v-for="option in tabOptions" :key="option.key">
          <q-tab :name="option.name" :icon="option.icon" :label="option.label" />
        </template>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Setting">
          <div class="q-pa-md">
            <div class="q-gutter-xs light-radio">
              <div class="text-subtitle1">网站模式</div>
              <q-radio v-model="dark" :val="false" label="明亮" />
              <q-radio v-model="dark" :val="true" label="夜间" />
              <q-radio v-model="dark" val="auto" label="自动" />
            </div>
            <q-separator />
            <div class="q-gutter-xs light-radio q-mt-md">
              <div class="text-subtitle1">设置页宽度</div>
              <q-radio v-model="generalSetting.globalWidth" :val="100" label="全宽" />
              <q-radio v-model="generalSetting.globalWidth" :val="75" label="75%" />
              <q-radio v-model="generalSetting.globalWidth" :val="50" label="50%" />
            </div>
            <q-separator />
            <div class="q-gutter-xs light-radio q-mt-md">
              <div class="text-subtitle1">其他选项</div>
              <q-toggle v-model="generalSetting.enableBlurHash" label="打开书籍封面自定义占位符" />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="Read">
          <div class="q-pa-md">
            <div class="q-gutter-xs bg-radio">
              <div class="text-subtitle1">阅读背景</div>
              <q-radio v-model="readSetting.bgType" val="none" label="无" />
              <q-radio v-model="readSetting.bgType" val="paper" label="纸质" />
              <q-radio v-model="readSetting.bgType" val="custom" label="自定义颜色" />
            </div>
            <q-color
              style="max-width: 200px"
              v-if="readSetting.bgType === 'custom'"
              v-model="readSetting.customColor"
              class="my-picker q-mt-md"
            />
            <q-separator />
            <div class="q-gutter-xs q-mt-md">
              <div class="text-subtitle1">文字转换</div>
              <q-radio v-model="readSetting.convert" :val="null" label="无" />
              <q-radio v-model="readSetting.convert" val="t2s" label="简化" />
              <q-radio v-model="readSetting.convert" val="s2t" label="繁化" />
            </div>
            <q-separator />
            <div class="q-gutter-xs q-mt-md">
              <div class="text-subtitle1">其他选项</div>
              <q-toggle v-model="readSetting.justify" label="两端对齐" />
              <q-toggle
                v-model="readSetting.showButton"
                :label="readSetting.showButton ? '显示底部按钮' : '隐藏底部按钮'"
              />
              <q-toggle v-model="readSetting.tapToScroll" label="点击边缘滚动页面" />
              <q-toggle v-model="readSetting.hideFullScreen" label="隐藏全屏按钮" />
            </div>
            <q-separator />
            <div class="q-gutter-xs q-mt-md">
              <div class="text-subtitle1">字体大小</div>
              <q-slider label v-model="readSetting.fontSize" :min="12" :max="30" />
            </div>
            <q-separator />
            <div class="q-gutter-xs q-mt-md">
              <div class="text-subtitle1"
                >阅读页宽度{{ readSetting.widthType === 'custom' ? '（设为 0 时为全屏，只在大屏幕下生效）' : '' }}</div
              >
              <q-radio v-model="readSetting.widthType" val="full" label="全屏" />
              <q-radio v-model="readSetting.widthType" val="medium" label="中" />
              <q-radio v-model="readSetting.widthType" val="small" label="小" />
              <q-radio v-model="readSetting.widthType" val="custom" label="自定义" />
              <div style="max-width: 150px">
                <q-input
                  v-model="readSetting.readPageWidth"
                  type="number"
                  dense
                  outlined
                  v-if="readSetting.widthType === 'custom'"
                  class="q-mt-md"
                >
                  <template v-slot:append>
                    <div>px</div>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="Edit">
          <div class="q-pa-md">
            <div class="q-gutter-xs">
              <div class="text-subtitle1">编辑器</div>
              <q-btn-toggle
                v-model="editorSetting.mode"
                toggle-color="primary"
                :options="[
                  { label: 'Html', value: 'html' },
                  { label: 'Markdown', value: 'markdown' }
                ]"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
  },
  {
    name: 'Edit',
    key: 'Edit',
    label: '编辑',
    icon: icon.mdiPen
  }
]

const settingStore = useSettingStore()
const { dark } = storeToRefs(settingStore)
const { readSetting, generalSetting, editorSetting } = settingStore

let tab = ref('Setting')

watch(dark, (newDark) => {
  Dark.set(newDark)
  settingStore.save()
})

watch([readSetting, generalSetting, editorSetting], settingStore.save)
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
