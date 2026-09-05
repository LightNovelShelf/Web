<template>
  <div class="chat-panel column no-wrap">
    <div class="chat-panel__header row items-center no-wrap gap-8">
      <q-btn v-if="showBack" dense flat round icon="mdiArrowLeft" @click="emit('back')" />

      <user-avatar v-if="peer" :user="peer" size="36px" :disabled="peer.IsDeleted" />

      <div class="ellipsis text-subtitle1 text-weight-medium">{{ peerName }}</div>

      <q-space />

      <q-btn dense flat round icon="mdiDotsVertical" aria-label="更多操作">
        <q-menu auto-close anchor="bottom right" self="top right">
          <q-list dense>
            <q-item clickable @click="toggleBlock">
              <q-item-section>
                <div class="chat-panel__menu-item">
                  <q-icon :name="chat.isBlockedByMe ? 'mdiAccountCheckOutline' : 'mdiAccountCancelOutline'" size="17px" />
                  {{ chat.isBlockedByMe ? '取消拉黑' : '拉黑' }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <q-separator />

    <div class="chat-panel__main">
      <overlay-scrollbars-component
        ref="scrollbarRef"
        class="chat-panel__scroll"
        :options="scrollbarOptions"
        :events="{ scroll: onScroll }"
        defer
      >
        <div v-if="!chat.loaded" class="row justify-center q-my-lg">
          <q-spinner-dots color="primary" size="32px" />
        </div>

        <template v-else>
          <div v-if="loadingOlder" class="row justify-center q-my-sm">
            <q-spinner-dots color="primary" size="24px" />
          </div>

          <div v-if="isEmpty" class="column flex-center text-opacity q-py-xl">
            <q-icon name="mdiMessageTextOutline" size="40px" />
            <div class="q-mt-sm">还没有消息，打个招呼吧</div>
          </div>

          <div class="chat-panel__messages column gap-8">
            <message-bubble
              v-for="message in chat.messages"
              :key="`m-${message.Id}`"
              :content="message.Content"
              :created-at="message.CreatedAt"
              :mine="message.SenderId === myId"
              :show-receipt="message.Id === receiptMessageId"
              :read="chat.peerLastReadMessageId >= message.Id"
            />

            <message-bubble
              v-for="item in chat.pending"
              :key="`p-${item.ClientMessageId}`"
              :content="item.Content"
              :created-at="item.CreatedAt"
              mine
              :status="item.status"
              @retry="retry(item.ClientMessageId)"
            />
          </div>
        </template>
      </overlay-scrollbars-component>

      <q-btn
        v-if="hasNewMessage"
        class="chat-panel__new-message"
        dense
        unelevated
        no-caps
        color="primary"
        icon="mdiChevronDown"
        label="有新消息"
        @click="scrollToBottom(true)"
      />
    </div>

    <q-separator />
    <div class="chat-panel__footer">
      <message-composer v-if="chat.canSend" @send="send" />
      <div v-else class="row items-center gap-8 text-opacity">
        <q-icon name="mdiAlertCircleOutline" size="20px" />
        <span>暂时无法发送私信</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'

import { useDirectMessageStore } from '@/stores/direct-message'
import { useSessionStore } from '@/stores/session'

import UserAvatar from '@/components/UserAvatar.vue'

import MessageBubble from './MessageBubble.vue'
import MessageComposer from './MessageComposer.vue'

import type { ChatState } from '@/stores/direct-message'
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-vue'

const props = withDefaults(defineProps<{ peerId: number; isActive?: boolean; showBack?: boolean }>(), {
  isActive: true,
  showBack: false,
})

const emit = defineEmits<{ back: [] }>()

/** 距底部多少像素内算「在底部」，决定是否自动跟随与标记已读 */
const BOTTOM_THRESHOLD = 80
/** 距顶部多少像素内触发加载更早的历史 */
const TOP_THRESHOLD = 80
/** store 里还没建会话壳子时的占位，避免模板里到处判空 */
const EMPTY_CHAT: ChatState = {
  peer: null,
  messages: [],
  pending: [],
  hasMore: false,
  nextBeforeMessageId: 0,
  myLastReadMessageId: 0,
  peerLastReadMessageId: 0,
  unreadCount: 0,
  isBlockedByMe: false,
  canSend: false,
  loaded: false,
}

const $q = useQuasar()
const route = useRoute()
const store = useDirectMessageStore()
const sessionStore = useSessionStore()

const scrollbarRef = ref<OverlayScrollbarsComponentRef>()
const stickToBottom = ref(true)
const hasNewMessage = ref(false)
const loadingOlder = ref(false)

// 会话壳子先建好，页面数据没到时也有稳定的空态可渲染
store.ensureChat(props.peerId)

const myId = computed(() => sessionStore.userId)
const chat = computed<ChatState>(() => store.chat(props.peerId) ?? EMPTY_CHAT)
const peer = computed(() => chat.value.peer ?? store.conversations.find((i) => i.Peer.Id === props.peerId)?.Peer ?? null)
const peerName = computed(() => {
  if (!peer.value) return '私信'
  return peer.value.IsDeleted ? '已注销用户' : peer.value.UserName
})
const isEmpty = computed(() => chat.value.messages.length === 0 && chat.value.pending.length === 0)

const lastMessageId = computed(() => chat.value.messages.at(-1)?.Id ?? 0)
const pendingCount = computed(() => chat.value.pending.length)

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

// 回执只挂在自己最后一条已入库的消息下；还有 pending 时最后一条自己的消息是 pending，不显示回执
const receiptMessageId = computed(() => {
  if (pendingCount.value > 0) return 0

  const messages = chat.value.messages
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].SenderId === myId.value) return messages[i].Id
  }
  return 0
})

function scrollToBottom(smooth = false) {
  const el = scrollElement()
  if (!el) return

  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  stickToBottom.value = true
  hasNewMessage.value = false
  void tryMarkRead()
}

async function loadOlder() {
  const el = scrollElement()
  if (!el || loadingOlder.value || !chat.value.loaded || !chat.value.hasMore) return

  loadingOlder.value = true
  const prevHeight = el.scrollHeight
  const prevTop = el.scrollTop
  try {
    await store.loadOlderMessages(props.peerId)
    await nextTick()
    // 顶部插入历史会把内容整体下推，按高度差补偿滚动位置，视觉上不跳动
    el.scrollTop = prevTop + (el.scrollHeight - prevHeight)
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  } finally {
    loadingOlder.value = false
  }
}

function onScroll() {
  const el = scrollElement()
  if (!el) return

  stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD
  if (stickToBottom.value) {
    hasNewMessage.value = false
    void tryMarkRead()
  }

  if (el.scrollTop <= TOP_THRESHOLD) void loadOlder()
}

async function tryMarkRead() {
  const state = chat.value
  if (!props.isActive || !state.loaded || !stickToBottom.value) return
  // 路由已经切到别的会话，或页面在后台标签页，都不算真正看到了
  if (Number(route.params.peerId) !== props.peerId) return
  if (document.visibilityState !== 'visible') return

  const last = state.messages.at(-1)
  if (!last || last.Id <= state.myLastReadMessageId) return

  try {
    await store.markRead(props.peerId, last.Id)
  } catch {
    // 已读上报失败不打扰用户，下次滚动或收到新消息时会再试
  }
}

async function send(content: string) {
  try {
    await store.sendMessage(props.peerId, content)
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  }
}

async function retry(clientMessageId: string) {
  try {
    await store.retryMessage(props.peerId, clientMessageId)
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  }
}

async function toggleBlock() {
  const next = !chat.value.isBlockedByMe
  try {
    await store.setBlock(props.peerId, next)
    $q.notify({ type: 'positive', message: next ? '已拉黑' : '已取消拉黑' })
  } catch (e) {
    $q.notify({ type: 'negative', message: getErrMsg(e) })
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') void tryMarkRead()
}

watch(
  () => chat.value.loaded,
  (loaded) => {
    if (loaded) void nextTick(() => scrollToBottom())
  },
)

// 自己发的消息立刻显示在末尾，必然跟随到底
watch(pendingCount, (count, prev) => {
  if (count > prev) void nextTick(() => scrollToBottom())
})

watch(lastMessageId, (id, prev) => {
  if (id <= prev) return

  const mine = chat.value.messages.at(-1)?.SenderId === myId.value
  if (mine || stickToBottom.value) void nextTick(() => scrollToBottom())
  else hasNewMessage.value = true
})

watch(
  () => props.isActive,
  (active) => {
    if (active) void tryMarkRead()
  },
)

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
  // 组件按 peerId 加 key，挂载即等于进入会话；数据已缓存时 loaded 不会再变化，这里补一次定位
  if (chat.value.loaded) void nextTick(() => scrollToBottom())
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibilityChange))
</script>

<style scoped lang="scss">
.chat-panel {
  height: 100%;
  min-height: 0;
}

// 与 ConversationList 头部同高，两栏的分割线才在一条线上
.chat-panel__header {
  min-height: 52px;
  padding: 8px 12px;
}

.chat-panel__menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-panel__main {
  position: relative;
  flex: 1;
  min-height: 0;
}

.chat-panel__scroll {
  height: 100%;
  padding: 12px;
}

.chat-panel__messages {
  align-items: stretch;
}

.chat-panel__new-message {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
}

.chat-panel__footer {
  padding: 8px 12px;
}
</style>
