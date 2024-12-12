<template>
  <div :style="styleObj">
    <slot />
  </div>
</template>

<script lang="ts">
import { useQuasar } from 'quasar'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'QGridItem',
  props: {
    // 栅格占据的列数
    span: {
      type: [Number, String],
      default: 1,
    },
    // 很小
    xs: {
      type: [Number, String],
    },
    // 小的
    sm: {
      type: [Number, String],
    },
    // 中等
    md: {
      type: [Number, String],
    },
    // 大的
    lg: {
      type: [Number, String],
    },
    // 很大
    xl: {
      type: [Number, String],
    },
  },
  setup(props) {
    const $q = useQuasar()
    const span = computed(() => {
      let col = null
      if ($q.screen.xs) col = props.xs
      else if ($q.screen.sm) col = props.sm
      else if ($q.screen.md) col = props.md
      else if ($q.screen.lg) col = props.lg
      else if ($q.screen.xl) col = props.xl
      return col ?? props.span
    })

    const styleObj = computed(() => ({
      'grid-column': `span ${span.value} / span 1`,
    }))

    return {
      styleObj,
    }
  },
})
</script>

<style scoped></style>
