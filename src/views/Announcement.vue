<template>
  <n-card title="公告标题" class="title mx-auto">
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
    公告内容<br />
  </n-card>
  <div class="title mx-auto" style="padding-top: 24px">
    <comment />
  </div>

  <n-back-top :right="50" />
</template>

<script>
import { defineComponent } from 'vue'
import Comment from '@/components/Comment'

export default defineComponent({
  name: 'Announcement',
  components: {
    Comment
  },
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
