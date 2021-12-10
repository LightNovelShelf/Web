<template>
  <div class="wrap">
    <template v-for="item in books" :key="item.value.Id">
      <div class="item">
        {{ item.value.Id }}
        <img v-if="item.value.Cover" :src="item.value.Cover" alt="cover" />
      </div>
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

<style lang="scss" scoped>
.wrap {
  display: grid;
  grid: auto-flow / 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
}
.item {
  background-color: red;
  color: white;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
