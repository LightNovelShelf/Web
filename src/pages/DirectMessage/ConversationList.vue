<template>
  <div class="conversation-list column no-wrap">
    <div class="conversation-list__header row items-center">
      <div class="text-subtitle1 text-weight-medium">私信</div>
    </div>
    <q-separator />

    <overlay-scrollbars-component
      ref="scrollbarRef"
      class="conversation-list__scroll"
      :options="scrollbarOptions"
      :events="{ scroll: onScroll }"
      defer
    >
      <q-list separator>
        <q-item
          v-for="conversation in store.conversations"
          :key="conversation.Peer.Id"
          clickable
          v-ripple
          :active="conversation.Peer.Id === activePeerId"
          active-class="conversation-item--active"
          @click="select(conversation.Peer.Id)"
        >
          <q-item-section avatar @click.stop>
            <user-avatar :user="conversation.Peer" size="44px" :disabled="conversation.Peer.IsDeleted" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="row items-center no-wrap gap-8">
              <span class="ellipsis">{{ peerName(conversation.Peer) }}</span>
              <q-space />
              <time-ago class="text-caption text-opacity" :value="conversation.LastMessage?.CreatedAt" />
            </q-item-label>
            <q-item-label caption lines="1">{{ preview(conversation) }}</q-item-label>
          </q-item-section>

          <q-item-section v-if="conversation.UnreadCount > 0" side>
            <q-badge color="red" rounded :label="conversation.UnreadCount > 99 ? '99+' : conversation.UnreadCount" />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="loading || loadingMore" class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="32px" />
      </div>

      <div v-else-if="store.conversations.length === 0" class="column flex-center text-opacity q-py-xl">
        <q-icon name="mdiMessageTextOutline" size="40px" />
        <div class="q-mt-sm">还没有私信</div>
        <div class="text-caption q-mt-xs">点开用户头像可以发起私信</div>
      </div>
    </overlay-scrollbars-component>
  </div>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'

import { useDirectMessageStore } from '@/stores/direct-message'

import TimeAgo from '@/components/TimeAgo.vue'
import UserAvatar from '@/components/UserAvatar.vue'

import type { DirectConversationItem, DirectMessagePeer } from '@/services/direct-message/type'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-vue'

const props = withDefaults(defineProps<{ activePeerId?: number; loading?: boolean }>(), {
  activePeerId: 0,
  loading: false,
})

const $q = useQuasar()
const router = useRouter()
const store = useDirectMessageStore()

const scrollbarRef = ref<OverlayScrollbarsComponentRef>()
const loadingMore = ref(false)

const scrollbarOptions = computed(() => ({
  scrollbars: {
    theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
    autoHide: 'move' as const,
    autoHideDelay: 300,
    autoHideSuspend: false,
  },
}))

// 真正滚动的是 OverlayScrollbars 生成的 viewport，不是组件根元素
function scrollElement(): HTMLElement | null {
  return scrollbarRef.value?.osInstance()?.elements().viewport ?? null
}

function peerName(peer: DirectMessagePeer) {
  return peer.IsDeleted ? '已注销用户' : peer.UserName
}

function preview(conversation: DirectConversationItem) {
  const content = conversation.LastMessage?.Content ?? ''
  return content.replace(/\s+/g, ' ').trim()
}

function select(peerId: number) {
  if (peerId === props.activePeerId) return
  void router.push({ name: 'DirectMessage', params: { peerId } })
}

async function loadMore() {
  if (loadingMore.value || !store.conversationsHasMore) return

  loadingMore.value = true
  try {
    await store.loadMoreConversations()
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  } finally {
    loadingMore.value = false
  }
}

function onScroll() {
  const el = scrollElement()
  if (!el) return

  if (el.scrollHeight - el.scrollTop - el.clientHeight <= 200) void loadMore()
}
</script>

<style scoped lang="scss">
.conversation-list {
  height: 100%;
  min-height: 0;
}

// 高度跟着 ChatPanel 头部走：那边由 36px 头像撑开，两栏分割线要对齐
.conversation-list__header {
  min-height: 52px;
  padding: 8px 12px;
}

// min-width 全都要显式归零：flex 子项默认 min-width:auto，
// 长正文会一路把滚动区和列表项撑出 320px 的列宽，省略号也就永远不生效
.conversation-list__scroll {
  flex: 1;
  min-width: 0;
  min-height: 0;

  // min-width 要显式归零：flex 子项默认 min-width:auto，
  // 长正文会把列表项撑出 320px 的列宽，省略号也就永远不生效
  :deep(.q-item__section--main) {
    min-width: 0;
  }
}

.conversation-item--active {
  background-color: rgba(0, 0, 0, 0.06);
}

.body--dark .conversation-item--active {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
