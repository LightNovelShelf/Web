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

import { getSystemImageMetadata, withImageHeight } from '@/utils/url'

import BlurHash from './BlurHash.vue'

const props = defineProps<{
  url: string
  requestHeight: number
  ratio?: number
}>()

defineOptions({ inheritAttrs: false })

const metadata = computed(() => getSystemImageMetadata(props.url))
const width = computed(() => metadata.value?.width ?? 2)
const height = computed(() => metadata.value?.height ?? 3)
const aspectRatio = computed(() => props.ratio ?? (metadata.value ? width.value / height.value : undefined))
const placeholder = computed(() => metadata.value?.placeholder)
const sourceUrl = computed(() => (metadata.value ? withImageHeight(props.url, props.requestHeight) : props.url))
</script>
