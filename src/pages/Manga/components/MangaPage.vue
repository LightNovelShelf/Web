<template>
  <q-img
    class="comic-page"
    :src="image.url"
    :ratio="image.width / image.height"
    :style="pageStyle"
    fit="contain"
    no-spinner
    no-transition
    :loading="loading"
    :alt="`漫画第 ${pageNumber} 页`"
  >
    <template v-if="image.placeholder && generalSetting.enableBlurHash" #loading>
      <blur-hash :blurhash="image.placeholder" />
    </template>
  </q-img>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useSettingStore } from 'stores/setting'

import BlurHash from 'components/BlurHash.vue'

import type { MangaImageAsset } from '../types'

const props = withDefaults(
  defineProps<{
    image: MangaImageAsset
    pageNumber: number
    loading?: 'eager' | 'lazy'
  }>(),
  { loading: 'lazy' },
)

const { generalSetting } = useSettingStore()
// --page-hw = 高/宽，供阅读器按真实宽高比计算「宽度撑满时的高度上限」
const pageStyle = computed(() => ({
  aspectRatio: `${props.image.width} / ${props.image.height}`,
  '--page-hw': props.image.width && props.image.height ? String(props.image.height / props.image.width) : undefined,
}))
</script>

<style lang="scss" scoped>
.comic-page {
  display: block;
  width: min(790px, 100%);
  max-width: 100%;
  height: auto;
  max-height: 100%;
  overflow: hidden;
  background: #fff;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
