<template>
  <q-icon :size="size" :tag="tag" :color="color" :left="left" :right="right">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path fill="currentColor" :d="path" />
    </svg>
  </q-icon>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    size: String,
    tag: String,
    color: String,
    path: String,
    left: Boolean,
    right: Boolean
  },
  setup() {
    return {}
  }
})
</script>

<style scoped></style>
