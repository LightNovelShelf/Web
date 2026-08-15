<template>
  <div v-intersection.once="onIntersection">
    <q-img
      v-if="visible"
      class="manga-cover"
      :src="manga.cover.url"
      :ratio="2 / 3"
      fit="cover"
      no-spinner
      :alt="`${manga.title}封面`"
    >
      <template v-if="manga.cover.placeholder && generalSetting.enableBlurHash" #loading>
        <blur-hash :blurhash="manga.cover.placeholder" />
      </template>
    </q-img>
    <q-responsive v-else :ratio="2 / 3" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { useSettingStore } from '@/stores/setting'

import { BlurHash } from '@/components'

import type { MangaImageAsset } from '../types'

defineProps<{ manga: { title: string; cover: MangaImageAsset } }>()

const { generalSetting } = useSettingStore()

const visible = ref(false)
function onIntersection(entry: IntersectionObserverEntry) {
  visible.value = entry.isIntersecting
  return true
}
</script>

<style lang="scss" scoped>
.manga-cover {
  display: block;
  width: 100%;
  overflow: hidden;
  background: #e5e5e5;
}
</style>
