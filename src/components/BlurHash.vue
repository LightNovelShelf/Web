<template>
  <canvas class="fit" ref="canvas" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { decode } from 'blurhash'

const props = defineProps<{ blurhash: string; width?: number; height?: number }>()

const canvas = ref<HTMLCanvasElement>()

watchEffect(() => {
  if (props.blurhash && canvas.value) {
    console.log({ w: canvas.value.clientWidth, h: canvas.value.clientHeight })
    const pixels = decode(
      props.blurhash,
      props.width || canvas.value.clientWidth,
      props.height || canvas.value.clientHeight
    )
    const ctx = canvas.value.getContext('2d')
    const imageData = ctx.createImageData(canvas.value.clientWidth, canvas.value.clientHeight)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
    debugger
  }
})
</script>

<style scoped></style>
