<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-tabs dense v-model="tab" class="text-teal">
        <template v-for="option in tabOptions" :key="option.key">
          <q-tab :name="option.name" :icon="option.icon" :label="option.label" />
        </template>
        <!-- <q-tab name="Read" :icon="icon.mdiFormatSize" label="阅读" />
        <q-tab name="Seeting" :icon="icon.mdiCog" label="设置" /> -->
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Read">
          <div class="q-pa-md">
            <div class="q-gutter-sm light-radio">
              <div>阅读模式</div>
              <q-radio v-model="dark" val="false" label="明亮" />
              <q-radio v-model="dark" val="true" label="夜间" />
              <q-radio v-model="dark" val="auto" label="自动" />
            </div>
            <div class="q-gutter-sm bg-radio">
              <div>阅读背景</div>
              <q-radio v-model="bg" val="none" label="无" />
              <q-radio v-model="bg" val="paper" label="纸质" />
              <q-radio v-model="bg" val="custom" label="自定义颜色" />
            </div>
            <q-color style="max-width: 200px" v-if="bg == 'custom'" v-model="customColor" class="my-picker" />
            <div>
              <div>字体大小</div>
              <q-slider label v-model="fontsize" :min="5" :max="30" />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="Seeting">
          <div class="text-h6">Alarms</div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.2
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { watch, defineComponent, ref, onActivated } from 'vue'
import { icon } from '@/plugins/icon'
import { Dark } from 'quasar'
import localforage from 'localforage'

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Read',
    key: 'Read',
    label: '阅读',
    icon: icon.mdiFormatSize
  },
  {
    name: 'Seeting',
    key: 'Seeting',
    label: '设置',
    icon: icon.mdiCog
  }
]

export default defineComponent({
  name: 'Setting',
  //   data() {
  //     return {
  //       tab: 'Read',
  //       dark: 'false',
  //       bg: 'none',
  //       customColor: '#FFFFFF'
  //     }
  //   },
  //   watch: {
  //     dark(newDark) {
  //       newDark = newDark != 'auto' ? newDark === 'true' : newDark
  //       Dark.set(newDark)
  //     },
  //     bg(newBg) {
  //       localforage.setItem('readBg', newBg)
  //     },
  //     customColor(newColor) {
  //       localforage.setItem('customColor', newColor)
  //     }
  //   },
  setup() {
    let tab = ref<string>('Read')
    let dark = ref<string>('')
    let bg = ref<string>('')
    let customColor = ref<string>('')
    let fontsize = ref<number>()

    const loadData = async () => {
      await localforage
        .getItem('bgColor')
        .then(function (value: { dark: string; bg: string; color: string; fontsize: number }) {
          dark.value = value.dark
          bg.value = value.bg
          customColor.value = value.color
          fontsize.value = value.fontsize
        })
        .catch(function (err) {
          //
        })
    }

    onActivated(loadData)

    watch([dark, bg, customColor, fontsize], ([newDark, newBg, newColor, newSize]) => {
      Dark.set(newDark != 'auto' ? newDark === 'true' : newDark)
      localforage.setItem('bgColor', {
        dark: newDark,
        bg: newBg,
        color: newColor,
        fontsize: newSize
      })
    })
    return {
      icon,
      tabOptions,
      tab,
      dark,
      bg,
      customColor,
      fontsize
    }
  }
})
</script>
