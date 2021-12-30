<template>
  <div class="title mx-auto">
    <q-card>
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

    <comment v-if="user" style="margin-top: 12px" :type="CommentType.Announcement" :id="_id" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, ref } from 'vue'
import { Comment } from '@/components/'
import { getAnnouncementDetail } from '@/services/context'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { Announcement, announcementFormat } from '@/views/Announcement/announcementFormat'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { CommentType } from '@/services/comment/types'
import { useAppStore } from '@/store'

defineComponent({ Comment })

const props = defineProps<{ id: string | number }>()
const _id = computed(() => ~~(props.id || '1'))

const appStore = useAppStore()
const user = computed(() => appStore.user)
const announcement = ref<Announcement>()

const request = useTimeoutFn(async () => {
  const res = await getAnnouncementDetail({ Id: _id.value })
  announcement.value = announcementFormat(res)
})
const ready = computed(() => _id.value === announcement.value?.Id)

useInitRequest(request)
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
