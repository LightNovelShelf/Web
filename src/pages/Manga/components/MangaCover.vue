<template>
  <q-img class="manga-cover" :src="manga.cover.url" :ratio="2 / 3" fit="cover" no-spinner :alt="`${manga.title}封面`">
    <template v-if="manga.cover.placeholder && generalSetting.enableBlurHash" #loading>
      <blur-hash :blurhash="manga.cover.placeholder" />
    </template>
  </q-img>
</template>

<script lang="ts" setup>
import { useSettingStore } from 'stores/setting'

import { BlurHash } from 'components'

import type { MangaImageAsset } from '../types'

defineProps<{ manga: { title: string; cover: MangaImageAsset } }>()

const { generalSetting } = useSettingStore()
</script>

<style lang="scss" scoped>
.manga-cover {
  display: block;
  width: 100%;
  overflow: hidden;
  background: #e5e5e5;
}
</style>
