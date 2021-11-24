<template>
  <n-card title="评论" :content-style="contentStyle">
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    评论内容<br />
    <template #action>
      <!--  后期改成下拉加载，看到Action条就加载下一页    -->
      <n-pagination style="justify-content: center" v-model:page="page" :page-count="100" />
    </template>
  </n-card>
</template>

<script lang="ts">
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
