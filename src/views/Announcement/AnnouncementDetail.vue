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

  <div class="title mx-auto" style="padding-top: 12px">
    <comment />
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted } from 'vue'
import Comment from '@/components/Comment.vue'
import { getAnnouncementDetail } from '@/services/context'

defineComponent({ Comment })
const props = defineProps<{ id: string | number }>()

onMounted(() => {
  getAnnouncementDetail({ Id: 1 })
})
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
