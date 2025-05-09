<template>
  <q-page padding class="title mx-auto">
    <q-card>
      <q-card-section>
        <div v-if="isActive" class="text-h6">
          [{{ announcement.Create.format('YYYY-MM-DD') }}] {{ announcement.Title }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <html-reader v-if="isActive" :html="sanitizerHtml(announcement.Content)"></html-reader>
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
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import sanitizerHtml from 'src/utils/sanitizeHtml'

import { useAppStore } from 'stores/app'

import { Comment } from 'components'
import HtmlReader from 'components/html/HtmlReader.vue'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { announcementFormat } from 'src/pages/Announcement/announcementFormat'
import { CommentType } from 'src/services/comment/types'
import { getAnnouncementDetail } from 'src/services/context'

import type { Announcement } from 'src/pages/Announcement/announcementFormat'

const props = defineProps<{ id: string | number }>()
const _id = computed(() => ~~(props.id || '1'))

const appStore = useAppStore()
const user = computed(() => appStore.user)
const announcement = ref<Announcement>()

const request = useTimeoutFn(async () => {
  const res = await getAnnouncementDetail({ Id: _id.value })
  announcement.value = announcementFormat(res)
})
const isActive = computed(() => _id.value === announcement.value?.Id)

useInitRequest(request, { isActive })
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
