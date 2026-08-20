<template>
  <q-img v-bind="$attrs" :src="sourceUrl" :ratio="aspectRatio" no-spinner>
    <template v-if="placeholder" #loading>
      <blur-hash :blurhash="placeholder" :width="width" :height="height" />
    </template>
    <slot />
  </q-img>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { getImageSize, getPlaceholder, withImageHeight } from '@/utils/url'

import BlurHash from './BlurHash.vue'

const props = defineProps<{
  url: string
  requestHeight: number
  ratio?: number
}>()

defineOptions({ inheritAttrs: false })

const imageSize = computed(() => getImageSize(props.url) ?? [2, 3])
const width = computed(() => imageSize.value[0])
const height = computed(() => imageSize.value[1])
const aspectRatio = computed(() => props.ratio ?? width.value / height.value)
const placeholder = computed(() => getPlaceholder(props.url))
const sourceUrl = computed(() => withImageHeight(props.url, props.requestHeight))
</script>
