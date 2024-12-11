<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <q-select
      :disable="loading"
      emit-value
      map-options
      filled
      v-model="type"
      :options="options"
      label="类别"
      style="max-width: 200px; margin-left: auto"
    />

    <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
      <q-grid-item v-for="book in bookData" :key="book['Id']">
        <book-card :book="book"></book-card>
      </q-grid-item>
    </q-grid>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import BookCard from 'src/components/BookCard.vue'
import { getRank } from 'src/services/book'
import { useQuasar } from 'quasar'
import type { BookInList } from 'src/services/book/types'
import { NOOP } from 'src/const/empty'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { QGrid, QGridItem } from 'src/components/grid'

const props = defineProps<{ type: 'daily' | 'weekly' | 'monthly' }>()

const options = [
  {
    label: '日榜',
    value: 'daily',
  },
  {
    label: '周榜',
    value: 'weekly',
  },
  {
    label: '月榜',
    value: 'monthly',
  },
]

const type = computed({
  get() {
    return props.type
  },
  set(val: string) {
    router.push({ name: 'BookRank', params: { type: val } })
  },
})

const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])

const request = useTimeoutFn(function (type = props.type) {
  const days = type == 'daily' ? 1 : type == 'weekly' ? 7 : 31
  return getRank(days).then((serverData) => {
    bookData.value = serverData
  })
})

const loading = request.loading

watch(request.loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) {
    $q.loadingBar.start()
  }
})

onBeforeRouteUpdate((to, from, next) => {
  request(to.params.type).then(() => next(), NOOP)
})

useInitRequest(request)
</script>

<style scoped lang="scss"></style>
