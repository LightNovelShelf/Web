<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// TODO 等实现
export default defineComponent({
  name: 'QGrid',
  props: {
    XGap: Number,
    YGap: Number
  },
  setup(props) {
    console.log(props)
  }
})
</script>

<style scoped></style>
