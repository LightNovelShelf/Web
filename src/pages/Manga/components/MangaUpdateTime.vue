<template>
  <span>{{ updateTime }}</span>
</template>

<script lang="ts" setup>
import { useToNowRef } from 'src/composition/useToNowRef'

const props = defineProps<{ updatedAt: string }>()
const updateTime = useToNowRef(() => props.updatedAt)
</script>
