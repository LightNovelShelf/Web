<template>
  <div v-for="item in books" :key="item.value.Id">
    <div>{{ item.value.Title }}</div>
    <template v-if="item.type === 'book'">
      <img style="width: 100px; height: auto; display: block" :src="item.value.Cover" alt="cover" />
      <add-to-shelf :book="item.value" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { defineComponent, onMounted, ref } from 'vue'
import * as ShelfTypes from '@/types/shelf'

defineComponent({ AddToShelf })

const loading = ref(true)
const books = ref<ShelfTypes.SheldItem[]>([])

onMounted(() => {
  // 全量读取列表
  shelfDB.getItems<ShelfTypes.SheldItem>().then((res) => {
    books.value = res.sort((a, b) => a.index - b.index)
    loading.value = false
  })
})
</script>
