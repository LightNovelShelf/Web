<template>
  <div class="q-gutter-md">
    <div>
      <q-grid :x-gap="16" :y-gap="16" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
        <q-grid-item v-for="forum in forumList" :key="forum.Id">
          <q-card>
            <q-img :src="forum.Cover" initial-ratio="1" />

            <q-card-section>
              <div class="text-h6">{{ forum.Title }}</div>
              <div class="text-caption text-grey">
                {{ forum.Description }}
              </div>
            </q-card-section>
          </q-card>
        </q-grid-item>
      </q-grid>
    </div>

    <div class="pagination" style="display: flex; justify-content: center">
      <q-pagination
        padding="4px"
        :disable="loading"
        v-model="currentPage"
        :max="pageData.totalPage"
        direction-links
        :icon-first="icon.mdiSkipPrevious"
        :icon-last="icon.mdiSkipNext"
        :icon-prev="icon.mdiChevronLeft"
        :icon-next="icon.mdiChevronRight"
        :max-pages="8"
        :input="!$q.screen.gt.sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QGrid, QGridItem } from 'src/components/grid'
import { getForumList } from 'src/services/forum'
import { ForumType } from 'src/services/forum/types'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { icon } from 'assets/icon'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

const props = defineProps<{ type: ForumType }>()

const forumList = ref()
const _page = ref(1)
const currentPage = computed({
  get() {
    return _page.value
  },
  set(val) {
    request(val)
  }
})
const pageData = ref({ totalPage: 1 })
const request = useTimeoutFn(async (page = currentPage.value) => {
  const serverData = (await getForumList({ Page: page, Size: 24, ForumType: props.type })) as any
  forumList.value = serverData.Data
  pageData.value.totalPage = serverData.TotalPages
})
const loading = request.loading

useInitRequest(request, { onlyRouteEnter: true })
</script>

<style scoped></style>
