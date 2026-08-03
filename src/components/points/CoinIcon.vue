<template>
  <svg
    class="coin-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="rimId" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E7A93B" />
        <stop offset="0.55" stop-color="#C4791A" />
        <stop offset="1" stop-color="#96550E" />
      </linearGradient>
      <linearGradient :id="faceId" x1="7" y1="4" x2="17" y2="20" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFEFB4" />
        <stop offset="0.45" stop-color="#F7C948" />
        <stop offset="1" stop-color="#DE9A22" />
      </linearGradient>
      <linearGradient :id="starId" x1="12" y1="6" x2="12" y2="18" gradientUnits="userSpaceOnUse">
        <stop stop-color="#A66A12" />
        <stop offset="1" stop-color="#7A4708" />
      </linearGradient>
    </defs>

    <!-- 币身与内圈台阶 -->
    <circle cx="12" cy="12" r="10.6" :fill="`url(#${rimId})`" />
    <circle cx="12" cy="12" r="8.7" :fill="`url(#${faceId})`" />
    <circle cx="12" cy="12" r="8.7" fill="none" stroke="#8A4F0C" stroke-opacity="0.35" stroke-width="0.5" />

    <!-- 中央四芒星，异世界货币的常见纹样 -->
    <path
      d="M12 6.8C12.5 10.4 13.6 11.5 17.2 12C13.6 12.5 12.5 13.6 12 17.2C11.5 13.6 10.4 12.5 6.8 12C10.4 11.5 11.5 10.4 12 6.8Z"
      :fill="`url(#${starId})`"
    />

    <!-- 高光 -->
    <ellipse cx="8.9" cy="8.1" rx="2.7" ry="1.4" fill="#FFFDF2" opacity="0.5" transform="rotate(-38 8.9 8.1)" />
  </svg>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const { size = '24px' } = defineProps<{ size?: string }>()

// 渐变 id 在文档内全局，多处渲染必须各自唯一
const uid = useId()
const rimId = `coin-rim-${uid}`
const faceId = `coin-face-${uid}`
const starId = `coin-star-${uid}`
</script>

<style scoped lang="scss">
.coin-icon {
  display: block;
  flex: none;
}
</style>
