<template>
  <q-card class="title mx-auto">
    <q-card-section>
      <div class="text-h6">公告标题 {{ id }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-for="index in 8" :key="index">公告内容</div>
    </q-card-section>
  </q-card>

  <div class="title mx-auto" style="padding-top: 24px">
    <comment />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Comment from '@/components/Comment.vue'

export default defineComponent({
  name: 'AnnouncementDetail',
  components: {
    Comment
  },
  props: {
    id: [String, Number]
  },
  setup(props) {
    return {}
  }
})
</script>

<style scoped lang="scss"></style>
