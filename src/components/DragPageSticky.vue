<template>
  <q-page-sticky v-touch-pan.prevent.mouse="moveFab" position="bottom-right" :offset="fabPos" style="z-index: 1">
    <slot :isDragging="isDragging" :x="initialOffset.x" :y="initialOffset.y" />
  </q-page-sticky>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import type { TouchPanValue } from 'quasar'

interface Props {
  initialOffset?: {
    x: number
    y: number
  }
  position?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
})

const fabPos = ref([0, 0])
const initialOffset = props.initialOffset || reactive({ x: 18, y: 18 })
const isDragging = ref(false)

watchEffect(() => {
  fabPos.value = [initialOffset.x, initialOffset.y]
})

const moveFab: TouchPanValue = (ev) => {
  isDragging.value = ev.isFirst !== true && ev.isFinal !== true
  initialOffset.x = fabPos.value[0] - ev.delta!.x!
  initialOffset.y = fabPos.value[1] - ev.delta!.y!
}
</script>

<style scoped></style>
