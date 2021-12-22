<template>
  <!-- 滚动加载 -->
  <div>History</div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import { getReadHistory } from '@/services/user'
import { getBookListByIds } from '@/services/book'

onMounted(async () => {
  console.log(await getReadHistory())
  console.log(await getBookListByIds([318, 329]))
})
</script>

<style scoped lang="scss"></style>
