<template>
  <div>editinfo</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ bid: string }>()
const bid = computed(() => ~~props.bid)
</script>

<style scoped lang="scss"></style>
