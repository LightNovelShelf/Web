<template>
  <q-card class="title mx-auto">
    <q-card-section>
      <div v-if="announcement" class="text-h6">{{ announcement.Creat }} {{ announcement.Title }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="announcement" v-html="sanitizerHtml(announcement.Content)"></div>
      <div v-else>
        <q-skeleton type="text" height="50px" width="50%" />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
        <q-skeleton type="text" height="50px" />
        <q-skeleton type="text" height="100px" />
      </div>
    </q-card-section>
  </q-card>

  <div class="title mx-auto" style="padding-top: 12px">
    <comment />
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted, ref } from 'vue'
import Comment from '@/components/Comment.vue'
import { getAnnouncementDetail } from '@/services/context'
import sanitizerHtml from '@/utils/sanitizeHtml'

defineComponent({ Comment })
const props = defineProps<{ id: string | number }>()
let announcement = ref(null)

onMounted(() => {
  const response = Promise.resolve(getAnnouncementDetail({ Id: ~~(props.id || '1') }))
  response.then((res) => {
    announcement.value = res
  })
})
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
