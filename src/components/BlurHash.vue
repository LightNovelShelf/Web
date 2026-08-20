<template>
  <canvas class="fit" ref="canvasRef" />
</template>

<script setup lang="ts">
import { decode } from 'blurhash'
import { ref, watchEffect } from 'vue'

const props = withDefaults(
  defineProps<{
    blurhash?: string
    width?: number
    height?: number
  }>(),
  {
    width: 2,
    height: 3,
  },
)

const canvasRef = ref<HTMLCanvasElement>()

watchEffect(() => {
  const { value: canvas } = canvasRef
  if (props.blurhash && canvas) {
    const decodingWidth = 24
    const decodingHeight = Math.min(64, Math.max(12, Math.round((decodingWidth * props.height) / props.width)))

    // canvas的width是指画布的逻辑大小，与canvas元素大小不一样时浏览器会自己拉伸，就像图片拉伸
    canvas.width = decodingWidth
    canvas.height = decodingHeight
    const pixels = decode(props.blurhash, decodingWidth, decodingHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    const imageData = ctx.createImageData(decodingWidth, decodingHeight)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  }
})
</script>

<style scoped></style>
