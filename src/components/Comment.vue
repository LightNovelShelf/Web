<template>
  <n-card title="评论" :content-style="contentStyle">
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    公告内容<br />
    <template #action>
      <n-pagination style="justify-content: center" v-model:page="page" :page-count="100" />
    </template>
  </n-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Comment',
  data() {
    return {
      page: 1
    }
  },
  props: {
    contentStyle: Object
  }
})
</script>

<style scoped></style>
