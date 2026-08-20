<template>
  <div v-intersection.once="onIntersection">
    <system-image
      v-if="visible"
      class="manga-cover"
      :url="manga.cover.url"
      :request-height="requestHeight"
      :ratio="2 / 3"
      fit="cover"
      :alt="`${manga.title}封面`"
    />
    <q-responsive v-else :ratio="2 / 3" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import SystemImage from '@/components/SystemImage.vue'

import type { MangaImageAsset } from '../types'

const props = defineProps<{
  manga: { title: string; cover: MangaImageAsset }
  requestHeight: number
}>()

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
