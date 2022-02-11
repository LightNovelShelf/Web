<template>
  <canvas class="fit" ref="canvas" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { decode } from 'blurhash'

const props = defineProps<{ blurhash: string }>()

const canvas = ref<HTMLCanvasElement>()

watchEffect(() => {
  if (props.blurhash && canvas.value) {
    const width = canvas.value.clientWidth
    const height = canvas.value.clientHeight

    canvas.value.width = width
    canvas.value.height = height
    const pixels = decode(props.blurhash, width, height)
    const ctx = canvas.value.getContext('2d')
    const imageData = ctx.createImageData(width, height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  }
})
</script>

<style scoped></style>
