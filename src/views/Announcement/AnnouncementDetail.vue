<template>
  <q-card class="title mx-auto">
    <q-card-section>
      <div v-if="ready" class="text-h6">[{{ announcement.Create }}] {{ announcement.Title }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="ready" v-html="sanitizerHtml(announcement.Content)"></div>
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
import { computed, defineComponent, ref, watch, onMounted } from 'vue'
import Comment from '@/components/Comment.vue'
import { getAnnouncementDetail } from '@/services/context'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { Announcement, announcementFormat } from '@/views/Announcement/announcementFormat'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

defineComponent({ Comment })

const props = defineProps<{ id: string | number }>()

const id = computed(() => ~~(props.id || '1'))
const announcement = ref<Announcement>()

const request = useTimeoutFn(async () => {
  const res = await getAnnouncementDetail({ Id: id.value })
  announcement.value = announcementFormat(res)
})
const ready = computed(() => announcement.value && id.value === announcement.value.Id)

watch(() => props.id, request)
onMounted(request.syncCall)
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
