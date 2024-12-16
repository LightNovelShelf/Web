<template>
  <div class="v-viewer" ref="viewerRef" v-viewer>
    <img v-if="showImage.src" :src="showImage.src" :alt="showImage.alt" />
  </div>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'

import { PROVIDE } from 'src/const/provide'

import 'viewerjs/dist/viewer.min.css'

// 用于单张图片预览
const showImage = reactive({
  src: '',
  alt: '',
})

const viewerRef = ref()

function show(scr: string, alt: string) {
  showImage.src = scr
  showImage.alt = alt
  viewerRef.value.$viewer.show()
}

provide(PROVIDE.IMAGE_PREVIEW, {
  show,
  get isShow() {
    return viewerRef.value.$viewer.isShown
  },
})
</script>

<style scoped lang="scss">
.v-viewer {
  display: none;
}
</style>
