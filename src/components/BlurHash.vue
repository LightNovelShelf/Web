<template>
  <canvas class="fit" ref="canvasRef" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { decode } from 'blurhash'

const props = defineProps<{ blurhash?: string }>()

const canvasRef = ref<HTMLCanvasElement>()

watchEffect(() => {
  const { value: canvas } = canvasRef
  if (props.blurhash && canvas) {
    /** img的比例就是 2/3 所以decode时也贴近这个比例 */
    const decodeSize = {
      width: 2 * 10,
      height: 3 * 10,
    }

    // canvas的width是指画布的逻辑大小，与canvas元素大小不一样时浏览器会自己拉伸，就像图片拉伸
    canvas.width = decodeSize.width
    canvas.height = decodeSize.height
    const pixels = decode(props.blurhash, decodeSize.width, decodeSize.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    const imageData = ctx.createImageData(decodeSize.width, decodeSize.height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  }
})
</script>

<style scoped></style>
