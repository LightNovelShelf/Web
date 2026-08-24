<template>
  <span>{{ text }}</span>
</template>

<script lang="ts" setup>
import { parseTime, toNow } from '@/utils/time'

import { useSharedNow } from '@/composition/useSharedNow'

import type { Dayjs } from 'dayjs'

const props = defineProps<{ value: Date | Dayjs | string | number | null | undefined }>()

const now = useSharedNow()

const text = computed(() => {
  const value = props.value
  if (!value) return ''

  // 时间戳先转成 Date：parseTime 只认 Date / Dayjs / ISO 字符串
  const date = typeof value === 'number' ? new Date(value) : value

  return toNow(parseTime(date), { now: parseTime(now.value), notNegative: true })
})
</script>
