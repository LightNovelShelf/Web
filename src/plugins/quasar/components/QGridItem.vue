<template>
  <div :style="styleObj">
    <slot />
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'QGridItem',
  props: {
    // 栅格占据的列数
    span: {
      type: [Number, String],
      default: 1
    }
  },
  setup(props) {
    const styleObj = computed(() => ({
      'grid-column': `span ${props.span} / span 1`
    }))

    return {
      styleObj
    }
  }
})
</script>

<style scoped></style>
