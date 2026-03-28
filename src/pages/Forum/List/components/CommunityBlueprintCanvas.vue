<template>
  <canvas ref="canvasRef" class="community-blueprint-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)

let frame = 0
let resizeObserver: ResizeObserver | null = null

function draw() {
  const canvas = canvasRef.value
  const parent = canvas?.parentElement
  if (!canvas || !parent) return

  const ratio = window.devicePixelRatio || 1
  const width = parent.clientWidth
  const height = parent.clientHeight

  canvas.width = Math.max(1, Math.floor(width * ratio))
  canvas.height = Math.max(1, Math.floor(height * ratio))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.12)'
  ctx.lineWidth = 1

  for (let x = 0; x < width; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y < height; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  const boxes = [
    { x: 28, y: 24, w: width * 0.22, h: height * 0.22 },
    { x: width * 0.34, y: 20, w: width * 0.28, h: height * 0.32 },
    { x: width * 0.67, y: 34, w: width * 0.18, h: height * 0.18 },
    { x: width * 0.18, y: height * 0.54, w: width * 0.24, h: height * 0.18 },
    { x: width * 0.58, y: height * 0.58, w: width * 0.24, h: height * 0.2 },
  ]

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.16)'

  for (const box of boxes) {
    ctx.beginPath()
    ctx.roundRect(box.x, box.y, box.w, box.h, 14)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.18)'
  ctx.beginPath()
  ctx.moveTo(80, height * 0.38)
  ctx.lineTo(width * 0.46, height * 0.38)
  ctx.lineTo(width * 0.46, height * 0.66)
  ctx.lineTo(width * 0.7, height * 0.66)
  ctx.stroke()

  const points = [
    [80, height * 0.38],
    [width * 0.46, height * 0.38],
    [width * 0.46, height * 0.66],
    [width * 0.7, height * 0.66],
  ]

  for (const [x, y] of points) {
    ctx.fillStyle = 'rgba(226, 232, 240, 0.55)'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function scheduleDraw() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(draw)
}

onMounted(() => {
  scheduleDraw()
  const parent = canvasRef.value?.parentElement
  if (parent) {
    resizeObserver = new ResizeObserver(() => scheduleDraw())
    resizeObserver.observe(parent)
  }
  window.addEventListener('resize', scheduleDraw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleDraw)
})
</script>

<style scoped>
.community-blueprint-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
