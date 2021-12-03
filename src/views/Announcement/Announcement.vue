<template>
  <!-- TODO 弄成下拉刷新 -->
  <q-list bordered separator class="rounded-borders title mx-auto">
    <q-item>
      <q-item-section class="text-h6">公告列表</q-item-section>
    </q-item>
    <q-item
      v-for="(index, data) in 5"
      :key="index"
      :to="{ name: 'AnnouncementDetail', params: { id: index } }"
      clickable
      v-ripple
    >
      <q-item-section>
        <q-item-label class="text-subtitle1">[2021.12.3] 我是公告标题</q-item-label>
        <q-item-label caption>我是公告内容，内容，内容，内容</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <q-item-label caption>{{ data }} 分钟前</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from 'vue'
import Comment from '@/components/Comment'

export default defineComponent({
  name: 'Announcement',
  setup() {
    return {}
  }
})
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
