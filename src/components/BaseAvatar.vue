<template>
  <q-avatar :size="size" :style="showImage ? undefined : fallbackStyle">
    <img v-if="showImage" class="base-avatar__image" :src="src!" :alt="alt || name" @error="imageFailed = true" />
    <span v-else class="base-avatar__fallback">{{ fallbackText }}</span>
    <slot />
  </q-avatar>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string | null
    name: string
    alt?: string
    size?: string
  }>(),
  {
    src: null,
    alt: '',
    size: '40px',
  },
)

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']
const imageFailed = ref(false)
const normalizedName = computed(() => props.name.trim())
const fallbackText = computed(() => Array.from(normalizedName.value)[0] ?? '?')
const backgroundColor = computed(() => {
  const hash = Array.from(normalizedName.value).reduce((sum, character) => sum + character.codePointAt(0)!, 0)
  return avatarPalette[hash % avatarPalette.length]
})
const showImage = computed(() => Boolean(props.src) && !imageFailed.value)
const fallbackStyle = computed(() => ({ backgroundColor: backgroundColor.value, color: '#fff' }))

watch(
  () => props.src,
  () => (imageFailed.value = false),
)
</script>

<style lang="scss" scoped>
.base-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.base-avatar__fallback {
  line-height: 1;
}
</style>
