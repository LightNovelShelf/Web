<template>
  <div>Search</div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import { getBookList } from '@/services/book'

defineComponent({ name: 'Search' })
onMounted(async () => {
  await getBookList({ Page: 1, Size: 24, KeyWords: '平均' })
})
</script>

<style scoped lang="scss"></style>
