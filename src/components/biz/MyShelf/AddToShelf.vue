<template>
  <q-btn v-if="bookId" :outline="liked" color="primary" :loading="loading" :label="label" @click="toggleShelf" />
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { useShelfStore } from '@/stores/shelf'

import { isRealtimeConnected } from '@/services/transport'

import type { BookServicesTypes } from '@/services/book'
import type { AnyVoidFunc } from '@/types/utils'

const props = defineProps<{ book: BookServicesTypes.BookInList | null }>()
const quasar = useQuasar()
const shelfStore = useShelfStore()
const bookId = computed(() => props.book?.Id ?? null)
const liked = computed(() => shelfStore.booksMap.has(bookId.value ?? -1))
const loading = computed(
  () => shelfStore.useLoading((state) => state.pull || state.push).value || !isRealtimeConnected.value,
)
const label = computed(() => (liked.value ? '移出书架' : '加入书架'))
let dismissNotification: AnyVoidFunc | undefined

async function toggleShelf() {
  if (!bookId.value) return

  dismissNotification?.()
  const nextLiked = !liked.value

  try {
    if (nextLiked) {
      await shelfStore.addToShelf({ id: bookId.value })
    } else {
      await shelfStore.removeFromShelf({ books: [bookId.value], push: true })
    }
    dismissNotification = quasar.notify({ message: nextLiked ? '加入成功' : '移除成功' })
  } catch (error) {
    dismissNotification = quasar.notify({ type: 'warning', message: getErrMsg(error) })
  }
}
</script>
