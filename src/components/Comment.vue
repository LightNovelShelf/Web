<template>
  <q-card>
    <q-card-section>
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
    </q-card-section>
  </q-card>
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
