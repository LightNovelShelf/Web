<template>
  <q-page class="direct-message-page" :style-fn="pageStyleFn">
    <div class="direct-message-page__layout" :class="{ 'direct-message-page__layout--desktop': isDesktop }">
      <conversation-list
        v-if="isDesktop || !activePeerId"
        class="direct-message-page__list"
        :active-peer-id="activePeerId"
        :loading="conversationsLoading"
      />

      <chat-panel
        v-if="activePeerId"
        :key="activePeerId"
        class="direct-message-page__chat"
        :peer-id="activePeerId"
        :is-active="isActive"
        :show-back="!isDesktop"
        @back="back"
      />

      <div v-else-if="isDesktop" class="direct-message-page__chat column flex-center text-opacity">
        <q-icon name="mdiMessageTextOutline" size="48px" />
        <div class="q-mt-sm">选择一个会话开始聊天</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'

import { useDirectMessageStore } from '@/stores/direct-message'

import { useInitRequest } from '@/composition/biz/useInitRequest'

import ChatPanel from './ChatPanel.vue'
import ConversationList from './ConversationList.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const store = useDirectMessageStore()

const isActive = ref(true)
const conversationsLoading = ref(false)

const isDesktop = computed(() => $q.screen.gt.sm)
const activePeerId = computed(() => {
  const raw = route.params.peerId
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isInteger(id) && id > 0 ? id : 0
})

// q-page 的高度要按 Quasar 布局算出的 offset 扣，聊天区才能自己滚而不是整页滚
function pageStyleFn(offset: number, height: number) {
  return { height: height ? `${height - offset}px` : `calc(100vh - ${offset}px)` }
}

async function loadChat(peerId: number) {
  try {
    await store.loadChat(peerId)
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  }
}

async function init() {
  conversationsLoading.value = true
  try {
    await store.loadConversations()
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  } finally {
    conversationsLoading.value = false
  }

  if (activePeerId.value) await loadChat(activePeerId.value)
}

function back() {
  void router.push({ name: 'DirectMessage', params: { peerId: '' } })
}

watch(activePeerId, (peerId) => {
  if (peerId) void loadChat(peerId)
})

onActivated(() => (isActive.value = true))
onDeactivated(() => (isActive.value = false))

useInitRequest(init)
</script>

<style scoped lang="scss">
.direct-message-page {
  overflow: hidden;
}

.direct-message-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;

  &--desktop {
    grid-template-columns: 320px minmax(0, 1fr);
  }
}

.direct-message-page__list,
.direct-message-page__chat {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.direct-message-page__layout--desktop .direct-message-page__list {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.body--dark .direct-message-page__layout--desktop .direct-message-page__list {
  border-right-color: rgba(255, 255, 255, 0.28);
}
</style>
