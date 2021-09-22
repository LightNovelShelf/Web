<template>
  <naive-icon v-bind="$attrs">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path fill="currentColor" :d="path" />
    </svg>
  </naive-icon>
</template>

<script>
import { defineComponent } from 'vue'
import { NIcon as naiveIcon } from 'naive-ui'

export default defineComponent({
  name: 'SvgIcon',
  components: {
    naiveIcon
  },
  props: {
    path: String
  },
  setup() {
    return {}
  }
})
</script>

<style scoped></style>
