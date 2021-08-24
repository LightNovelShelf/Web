<template>
  <!-- 默认是1，容器超过600px变2 -->
  <n-grid :x-gap="12" :y-gap="8" cols="1 600:2">
    <n-grid-item>
      <div>
        <n-list bordered>
          <template #header>
            <n-space justify="space-between">
              <div>公告</div>
              <div>更多</div>
            </n-space>
          </template>
          <n-list-item> 公告1 </n-list-item>
          <n-list-item> 公告2 </n-list-item>
          <n-list-item> 公告3 </n-list-item>
          <n-list-item> 公告4 </n-list-item>
          <n-list-item> 公告5 </n-list-item>
        </n-list>
        <n-list bordered>
          <template #header>
            <n-space justify="space-between">
              <div>公告</div>
              <div>更多</div>
            </n-space>
          </template>
          <n-list-item> 公告1 </n-list-item>
          <n-list-item> 公告2 </n-list-item>
          <n-list-item> 公告3 </n-list-item>
          <n-list-item> 公告4 </n-list-item>
          <n-list-item> 公告5 </n-list-item>
        </n-list>
      </div>
    </n-grid-item>
    <n-grid-item>
      <div class="green">
        <n-card title="卡片"> 卡片内容 </n-card>
      </div>
    </n-grid-item>
  </n-grid>
</template>

<script>
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  setup() {
    return {}
  }
})
</script>

<style scoped>
:deep(ul:first-child) {
  margin-top: 0;
}
.light-green {
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  background-color: rgba(0, 128, 0, 0.24);
}
</style>
