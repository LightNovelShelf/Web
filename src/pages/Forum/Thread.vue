<template>
  <q-page class="thread-page">
    <div class="thread-page__shell">
      <div v-if="loading" class="thread-page__loading">
        <q-skeleton type="text" width="20%" />
        <q-skeleton type="text" width="60%" class="q-mt-md" />
        <q-skeleton type="text" width="88%" class="q-mt-sm" />
        <q-skeleton type="rect" height="240px" class="q-mt-lg" />
      </div>

      <template v-else-if="thread">
        <q-breadcrumbs class="thread-page__breadcrumbs">
          <q-breadcrumbs-el label="社区" :to="{ name: 'ForumList' }" />
          <q-breadcrumbs-el
            :label="thread.BoardName"
            :to="{ name: 'ForumList', query: { board: thread.BoardKey, category: thread.SubCategoryKey } }"
          />
          <q-breadcrumbs-el label="帖子详情" />
        </q-breadcrumbs>

        <div class="thread-page__grid">
          <main class="thread-page__main">
            <article class="thread-card">
              <div class="thread-card__topline">
                <div class="thread-card__topline-meta">
                  <span class="thread-card__board">{{ thread.BoardName }}</span>
                  <span v-if="thread.SubCategoryLabel" class="thread-card__sub-category">{{
                    thread.SubCategoryLabel
                  }}</span>
                  <span v-if="thread.Pinned" class="thread-card__flag thread-card__flag--pinned">置顶</span>
                  <span v-if="thread.Featured" class="thread-card__flag thread-card__flag--featured">精华</span>
                  <span v-if="thread.Locked" class="thread-card__flag thread-card__flag--locked">已锁定</span>
                </div>

                <div class="thread-card__actions thread-card__actions--top">
                  <q-btn
                    unelevated
                    class="thread-card__action-btn"
                    :class="{ 'thread-card__action-btn--active': thread.Favorited }"
                    :icon="thread.Favorited ? 'mdiBookmark' : 'mdiBookmarkOutline'"
                    :label="`${thread.Favorites}`"
                    :disable="thread.Locked || togglingFavorite"
                    :loading="togglingFavorite"
                    :aria-label="thread.Favorited ? '已收藏' : '收藏'"
                    @click="handleToggleFavorite"
                  />
                  <q-btn
                    unelevated
                    class="thread-card__action-btn"
                    :class="{ 'thread-card__action-btn--active': thread.Liked }"
                    :icon="thread.Liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                    :label="`${thread.Likes}`"
                    :disable="thread.Locked || togglingLike"
                    :loading="togglingLike"
                    :aria-label="thread.Liked ? '已点赞' : '点赞'"
                    @click="handleToggleThreadLike"
                  />
                </div>
              </div>

              <h1 class="thread-card__title">{{ thread.Title }}</h1>

              <div class="thread-card__meta">
                <div class="thread-card__author">
                  <q-avatar
                    size="42px"
                    :style="
                      thread.AuthorAvatar
                        ? undefined
                        : { background: avatarBackground(thread.AuthorName), color: '#fff' }
                    "
                  >
                    <img
                      v-if="thread.AuthorAvatar"
                      class="community-avatar__image"
                      :src="thread.AuthorAvatar"
                      :alt="thread.AuthorName"
                    />
                    <template v-else>{{ thread.AuthorName.slice(0, 1) }}</template>
                  </q-avatar>
                  <div>
                    <div class="thread-card__author-name">{{ thread.AuthorName }}</div>
                    <div class="thread-card__author-time">{{ formatPublishedAt(thread.PublishedAt) }}</div>
                  </div>
                </div>

                <div class="thread-card__stats">
                  <span>评论 {{ thread.Replies }}</span>
                  <span>浏览 {{ thread.Views }}</span>
                  <span>热度 {{ thread.Heat }}</span>
                </div>
              </div>

              <div class="thread-card__body">
                <html-reader :html="sanitizerHtml(thread.BodyHtml)" />
              </div>

              <div class="thread-card__tags">
                <span v-for="tag in thread.Tags" :key="tag" class="thread-card__tag">{{ tag }}</span>
              </div>
            </article>

            <section class="reply-panel">
              <div class="reply-panel__header">
                <div>
                  <h2>回复</h2>
                  <span>当前已加载 {{ replyItems.length }} / {{ replyPagination.Total }} 个楼层</span>
                </div>
                <div v-if="thread.Locked" class="reply-panel__lock">当前帖子已锁定，只能浏览。</div>
              </div>

              <div ref="replyComposerRef" class="reply-composer">
                <div v-if="replyTarget" class="reply-composer__target">
                  正在回复 <strong>{{ replyTarget.AuthorName }}</strong>
                  <q-btn flat dense no-caps color="primary" label="取消" @click="replyTarget = null" />
                </div>

                <q-input
                  v-model="draftReply"
                  autogrow
                  outlined
                  class="reply-composer__input"
                  :disable="thread.Locked"
                  :placeholder="replyPlaceholder"
                />

                <div class="reply-composer__actions">
                  <div class="reply-composer__hint">
                    {{ thread.Locked ? '锁帖后不能继续回复。' : '支持回复楼主，也支持对某条回复发起二级回应。' }}
                  </div>
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="mdiSend"
                    label="发布回复"
                    :disable="thread.Locked || !draftReply.trim()"
                    :loading="submittingReply"
                    @click="handleSubmitReply"
                  />
                </div>
              </div>

              <div v-if="replyError" class="reply-panel__error">
                <q-icon name="mdiAlertCircleOutline" size="18px" color="negative" />
                <span>{{ replyError }}</span>
              </div>

              <div class="reply-list">
                <article
                  v-for="reply in replyItems"
                  :id="replyDomId(reply.Id)"
                  :key="reply.Id"
                  class="reply-item"
                  :class="{ 'reply-item--focused': focusedReplyId === reply.Id }"
                >
                  <div class="reply-item__header">
                    <div class="reply-item__author">
                      <q-avatar
                        size="34px"
                        :style="
                          reply.AuthorAvatar
                            ? undefined
                            : { background: avatarBackground(reply.AuthorName), color: '#fff' }
                        "
                      >
                        <img
                          v-if="reply.AuthorAvatar"
                          class="community-avatar__image"
                          :src="reply.AuthorAvatar"
                          :alt="reply.AuthorName"
                        />
                        <template v-else>{{ reply.AuthorName.slice(0, 1) }}</template>
                      </q-avatar>
                      <div>
                        <div class="reply-item__name-row">
                          <span class="reply-item__name">{{ reply.AuthorName }}</span>
                          <span v-if="reply.AuthorBadge" class="reply-item__badge">{{ reply.AuthorBadge }}</span>
                          <button
                            v-if="reply.ReplyTo"
                            type="button"
                            class="reply-item__reply-to reply-item__reply-to--clickable"
                            @click="scrollToReply(reply.ReplyTo.Id)"
                          >
                            回复 {{ reply.ReplyTo.AuthorName }}
                          </button>
                        </div>
                        <div class="reply-item__time">{{ formatPublishedAt(reply.PublishedAt) }}</div>
                      </div>
                    </div>

                    <div class="reply-item__tools">
                      <q-btn
                        flat
                        no-caps
                        dense
                        class="reply-item__tool-btn"
                        icon="mdiReplyOutline"
                        label="回应"
                        :disable="thread.Locked"
                        @click="handleStartReply(reply.Id, reply.AuthorName)"
                      />
                      <q-btn
                        flat
                        no-caps
                        dense
                        class="reply-item__like-btn"
                        :class="{ 'reply-item__like-btn--active': reply.Liked }"
                        :icon="reply.Liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                        :label="`${reply.Likes}`"
                        :disable="thread.Locked || togglingReplyIds.has(reply.Id)"
                        @click="handleToggleReplyLike(reply.Id)"
                      />
                    </div>
                  </div>

                  <p class="reply-item__content">{{ reply.Content }}</p>

                  <div v-if="reply.ChildReplies.length" class="reply-children">
                    <article
                      v-for="child in reply.ChildReplies"
                      :id="replyDomId(child.Id)"
                      :key="child.Id"
                      class="reply-child"
                      :class="{ 'reply-child--focused': focusedReplyId === child.Id }"
                    >
                      <div class="reply-child__header">
                        <div class="reply-item__author">
                          <q-avatar
                            size="30px"
                            :style="
                              child.AuthorAvatar
                                ? undefined
                                : { background: avatarBackground(child.AuthorName), color: '#fff' }
                            "
                          >
                            <img
                              v-if="child.AuthorAvatar"
                              class="community-avatar__image"
                              :src="child.AuthorAvatar"
                              :alt="child.AuthorName"
                            />
                            <template v-else>{{ child.AuthorName.slice(0, 1) }}</template>
                          </q-avatar>
                          <div>
                            <div class="reply-item__name-row">
                              <span class="reply-item__name">{{ child.AuthorName }}</span>
                              <span v-if="child.AuthorBadge" class="reply-item__badge">{{ child.AuthorBadge }}</span>
                              <button
                                v-if="child.ReplyTo"
                                type="button"
                                class="reply-item__reply-to reply-item__reply-to--clickable"
                                @click="scrollToReply(child.ReplyTo.Id)"
                              >
                                回复 {{ child.ReplyTo.AuthorName }}
                              </button>
                            </div>
                            <div class="reply-item__time">{{ formatPublishedAt(child.PublishedAt) }}</div>
                          </div>
                        </div>

                        <div class="reply-item__tools">
                          <q-btn
                            flat
                            no-caps
                            dense
                            class="reply-item__tool-btn"
                            icon="mdiReplyOutline"
                            label="回应"
                            :disable="thread.Locked"
                            @click="handleStartReply(child.Id, child.AuthorName)"
                          />
                          <q-btn
                            flat
                            no-caps
                            dense
                            class="reply-item__like-btn"
                            :class="{ 'reply-item__like-btn--active': child.Liked }"
                            :icon="child.Liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                            :label="`${child.Likes}`"
                            :disable="thread.Locked || togglingReplyIds.has(child.Id)"
                            @click="handleToggleReplyLike(child.Id)"
                          />
                        </div>
                      </div>

                      <p class="reply-child__content">{{ child.Content }}</p>
                    </article>
                  </div>

                  <div v-if="reply.ChildPage.HasMore" class="reply-children__footer">
                    <q-btn
                      flat
                      no-caps
                      color="primary"
                      :loading="loadingChildReplyIds.has(reply.Id)"
                      label="加载更多楼中楼"
                      @click="handleLoadMoreChildReplies(reply.Id)"
                    />
                  </div>
                </article>
              </div>

              <div v-if="replyPagination.HasMore" class="reply-panel__footer">
                <q-btn
                  outline
                  no-caps
                  color="primary"
                  :loading="loadingMoreReplies"
                  label="加载更多回复"
                  @click="handleLoadMoreReplies"
                />
              </div>
            </section>
          </main>

          <aside class="thread-page__aside">
            <section class="side-panel">
              <h3>近期阅读</h3>
              <div v-if="recentThreadItems.length" class="related-list">
                <router-link
                  v-for="item in recentThreadItems"
                  :key="item.id"
                  class="related-item"
                  :to="{ name: 'ForumThread', params: { id: item.id } }"
                >
                  <div class="related-item__title">{{ item.title }}</div>
                  <div class="related-item__meta">{{ item.boardName }} · {{ item.viewedAtLabel }}</div>
                </router-link>
              </div>
              <div v-else class="side-panel__empty">你最近浏览过的帖子会显示在这里。</div>
            </section>

            <section class="side-panel">
              <h3>相关帖子</h3>
              <div class="related-list">
                <router-link
                  v-for="item in thread.RelatedThreads"
                  :key="item.Id"
                  class="related-item"
                  :to="{ name: 'ForumThread', params: { id: item.Id } }"
                >
                  <div class="related-item__title">{{ item.Title }}</div>
                  <div class="related-item__meta">{{ item.BoardName }} · 评论 {{ item.Replies }}</div>
                </router-link>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <div v-else class="thread-page__empty">
        <q-icon name="mdiFileAlertOutline" size="44px" color="primary" />
        <h2>帖子不存在</h2>
        <p>{{ loadError || '这条帖子可能已经被删除，或者当前 mock 数据里还没有它。' }}</p>
        <q-btn unelevated no-caps color="primary" label="返回社区首页" :to="{ name: 'ForumList' }" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'

import sanitizerHtml from 'src/utils/sanitizeHtml'
import { parseTime, toNow } from 'src/utils/time'

import { useAppStore } from 'stores/app'

import HtmlReader from 'components/html/HtmlReader.vue'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import {
  createCommunityReply,
  getCommunityReplyChildren,
  getCommunityThread,
  toggleReplyLike,
  toggleThreadFavorite,
  toggleThreadLike,
} from 'src/services/forum'

import type {
  CommunityPagination,
  CommunityReplyTarget,
  CommunityThreadDetail,
  CommunityThreadReply,
} from 'src/services/forum'

const props = defineProps<{ id: string }>()
const RECENT_THREAD_STORAGE_KEY = 'community.recentThreads'
const RECENT_THREAD_LIMIT = 6

interface RecentThreadHistoryItem {
  id: number
  title: string
  boardName: string
  viewedAt: number
}

interface RecentThreadCardItem extends RecentThreadHistoryItem {
  viewedAtLabel: string
}

const appStore = useAppStore()
const { user } = storeToRefs(appStore)
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const thread = ref<CommunityThreadDetail | null>(null)
const replyItems = ref<CommunityThreadReply[]>([])
const loading = ref(true)
const loadingMoreReplies = ref(false)
const loadingChildReplyIds = ref<Set<number>>(new Set())
const togglingLike = ref(false)
const togglingFavorite = ref(false)
const togglingReplyIds = ref<Set<number>>(new Set())
const submittingReply = ref(false)
const draftReply = ref('')
const loadError = ref('')
const replyError = ref('')
const replyPage = ref(1)
const replyTarget = ref<CommunityReplyTarget | null>(null)
const replyComposerRef = ref<HTMLElement | null>(null)
const recentThreadItems = ref<RecentThreadCardItem[]>([])

const emptyPagination: CommunityPagination = {
  Page: 1,
  Size: 5,
  Total: 0,
  TotalPages: 1,
  HasMore: false,
}

const replyPagination = computed(() => thread.value?.RepliesPage ?? emptyPagination)
const focusedReplyId = ref<number | null>(null)
const threadId = computed(() => {
  const parsed = Number(props.id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
})
const notificationReplyId = computed(() => {
  const raw = route.query.replyId
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})
const notificationParentReplyId = computed(() => {
  const raw = route.query.parentReplyId
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})
const notificationFocusKey = computed(() => {
  if (!notificationReplyId.value && !notificationParentReplyId.value) {
    return ''
  }

  return `${props.id}:${notificationReplyId.value ?? ''}:${notificationParentReplyId.value ?? ''}`
})
const handledNotificationFocusKey = ref('')
const isActive = computed(() => thread.value?.Id === threadId.value)
const replyPlaceholder = computed(() => {
  if (thread.value?.Locked) {
    return '当前帖子已锁定'
  }

  if (replyTarget.value) {
    return `回复 ${replyTarget.value.AuthorName}...`
  }

  return '写下你的看法，补充观点或者回应楼主。'
})

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}

function formatPublishedAt(value: string) {
  return toNow(parseTime(value))
}

function formatRecentViewedAt(viewedAt: number) {
  const diff = Date.now() - viewedAt
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  }

  return `${Math.floor(diff / day)} 天前`
}

function readRecentThreadHistory() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(RECENT_THREAD_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as RecentThreadHistoryItem[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecentThreadHistory(items: RecentThreadHistoryItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(RECENT_THREAD_STORAGE_KEY, JSON.stringify(items.slice(0, RECENT_THREAD_LIMIT)))
}

function syncRecentThreadItems(currentThreadId?: number) {
  recentThreadItems.value = readRecentThreadHistory()
    .filter((item) => item.id !== currentThreadId)
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, 4)
    .map((item) => ({
      ...item,
      viewedAtLabel: formatRecentViewedAt(item.viewedAt),
    }))
}

function pushRecentThreadHistory(item: RecentThreadHistoryItem) {
  const nextItems = [item, ...readRecentThreadHistory().filter((historyItem) => historyItem.id !== item.id)]
  writeRecentThreadHistory(nextItems)
  syncRecentThreadItems(item.id)
}

function requireLogin() {
  if (user.value) {
    return true
  }

  $q.notify({
    type: 'warning',
    message: '请先登录后再参与讨论',
  })
  void router.push({ name: 'Login', query: { from: encodeURIComponent(route.fullPath) } })
  return false
}

function findReplyById(replyId: number) {
  for (const reply of replyItems.value) {
    if (reply.Id === replyId) {
      return reply
    }

    const child = reply.ChildReplies.find((item) => item.Id === replyId)
    if (child) {
      return child
    }
  }

  return undefined
}

function findRootReply(replyId: number) {
  for (const reply of replyItems.value) {
    if (reply.Id === replyId || reply.ChildReplies.some((item) => item.Id === replyId)) {
      return reply
    }
  }

  return undefined
}

async function handleStartReply(replyId: number, authorName: string) {
  replyTarget.value = { Id: replyId, AuthorName: authorName }

  await nextTick()

  replyComposerRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })

  window.setTimeout(() => {
    const textarea = replyComposerRef.value?.querySelector('textarea')
    textarea?.focus()
  }, 250)
}

function replyDomId(replyId: number) {
  return `reply-${replyId}`
}

async function loadMoreChildReplies(parentReplyId: number) {
  if (!thread.value || loadingChildReplyIds.value.has(parentReplyId)) {
    return false
  }

  const target = replyItems.value.find((item) => item.Id === parentReplyId)
  if (!target || !target.ChildPage.HasMore) {
    return false
  }

  loadingChildReplyIds.value = new Set(loadingChildReplyIds.value).add(parentReplyId)

  try {
    const next = await getCommunityReplyChildren({
      threadId: thread.value.Id,
      parentReplyId,
      page: target.ChildPage.Page + 1,
      size: target.ChildPage.Size,
    })

    target.ChildReplies = [...target.ChildReplies, ...next.Items]
    target.ChildPage = next.Page
    return true
  } finally {
    const nextIds = new Set(loadingChildReplyIds.value)
    nextIds.delete(parentReplyId)
    loadingChildReplyIds.value = nextIds
  }
}

async function ensureRootReplyVisible(parentReplyId: number) {
  if (findReplyById(parentReplyId)) {
    return true
  }

  while (thread.value?.RepliesPage.HasMore) {
    await loadThread({ appendReplies: true, trackView: false })
    if (findReplyById(parentReplyId)) {
      return true
    }
  }

  return false
}

async function ensureReplyVisible(replyId: number, parentReplyId?: number | null) {
  if (findReplyById(replyId)) {
    return true
  }

  if (parentReplyId && parentReplyId !== replyId) {
    const rootVisible = await ensureRootReplyVisible(parentReplyId)
    if (!rootVisible) {
      return false
    }

    const rootReply = findRootReply(parentReplyId)
    if (!rootReply) {
      return false
    }

    while (rootReply.ChildPage.HasMore) {
      await loadMoreChildReplies(rootReply.Id)
      if (findReplyById(replyId)) {
        return true
      }
    }

    return false
  }

  if (!(await ensureRootReplyVisible(replyId))) {
    return false
  }

  for (const reply of replyItems.value) {
    while (reply.ChildPage.HasMore) {
      await loadMoreChildReplies(reply.Id)
      if (findReplyById(replyId)) {
        return true
      }
    }
  }

  return false
}

function focusReply(replyId: number) {
  focusedReplyId.value = replyId

  window.setTimeout(() => {
    if (focusedReplyId.value === replyId) {
      focusedReplyId.value = null
    }
  }, 2600)
}

async function scrollToReply(replyId: number, parentReplyId?: number | null) {
  if (!thread.value) {
    return
  }

  const visible = await ensureReplyVisible(replyId, parentReplyId)
  if (!visible) {
    $q.notify({
      type: 'warning',
      message: '目标回复暂时未加载出来',
    })
    return
  }

  await nextTick()

  const element = document.getElementById(replyDomId(replyId))
  if (!element) {
    return
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })

  focusReply(replyId)
}

async function focusReplyFromNotification() {
  if (
    !thread.value ||
    !notificationFocusKey.value ||
    handledNotificationFocusKey.value === notificationFocusKey.value
  ) {
    return
  }

  const targetReplyId = notificationReplyId.value ?? notificationParentReplyId.value
  if (!targetReplyId) {
    return
  }

  await scrollToReply(targetReplyId, notificationParentReplyId.value)
  handledNotificationFocusKey.value = notificationFocusKey.value
}

async function loadThread(options: { appendReplies?: boolean; trackView?: boolean } = {}) {
  const appendReplies = options.appendReplies ?? false
  const nextReplyPage = appendReplies ? replyPage.value + 1 : 1

  if (appendReplies) {
    loadingMoreReplies.value = true
  } else {
    loading.value = true
    loadError.value = ''
    replyPage.value = 1
    replyItems.value = []
    replyTarget.value = null
    draftReply.value = ''
  }

  const data = await getCommunityThread(threadId.value, nextReplyPage, undefined, {
    trackView: options.trackView ?? !appendReplies,
  })

  if (!data) {
    thread.value = null
    loadError.value = '当前帖子不存在。'
    loading.value = false
    loadingMoreReplies.value = false
    return
  }

  thread.value = data
  replyPage.value = nextReplyPage
  replyItems.value = appendReplies ? [...replyItems.value, ...data.ReplyItems] : data.ReplyItems
  pushRecentThreadHistory({
    id: data.Id,
    title: data.Title,
    boardName: data.BoardName,
    viewedAt: Date.now(),
  })
  await nextTick()
  await focusReplyFromNotification()
  loading.value = false
  loadingMoreReplies.value = false
}

async function handleToggleThreadLike() {
  if (!thread.value || thread.value.Locked || !requireLogin()) {
    return
  }

  togglingLike.value = true
  try {
    const nextState = await toggleThreadLike(thread.value.Id)
    thread.value.Liked = nextState.Liked
    thread.value.Likes = nextState.Likes
  } finally {
    togglingLike.value = false
  }
}

async function handleToggleFavorite() {
  if (!thread.value || thread.value.Locked || !requireLogin()) {
    return
  }

  togglingFavorite.value = true
  try {
    const nextState = await toggleThreadFavorite(thread.value.Id)
    thread.value.Favorited = nextState.Favorited
    thread.value.Favorites = nextState.Favorites
  } finally {
    togglingFavorite.value = false
  }
}

async function handleToggleReplyLike(replyId: number) {
  if (!thread.value || thread.value.Locked || !requireLogin()) {
    return
  }

  togglingReplyIds.value = new Set(togglingReplyIds.value).add(replyId)

  try {
    const nextState = await toggleReplyLike(thread.value.Id, replyId)
    const target = findReplyById(replyId)
    if (target) {
      target.Liked = nextState.Liked
      target.Likes = nextState.Likes
    }
  } finally {
    const nextIds = new Set(togglingReplyIds.value)
    nextIds.delete(replyId)
    togglingReplyIds.value = nextIds
  }
}

async function handleSubmitReply() {
  if (!thread.value || thread.value.Locked || !draftReply.value.trim() || !requireLogin()) {
    return
  }

  submittingReply.value = true
  replyError.value = ''

  try {
    const created = await createCommunityReply({
      threadId: thread.value.Id,
      content: draftReply.value,
      replyToId: replyTarget.value?.Id,
    })

    if (replyTarget.value) {
      const rootReply = findRootReply(replyTarget.value.Id)
      if (rootReply) {
        rootReply.ChildReplies = [...rootReply.ChildReplies, created]
        const total = rootReply.ChildPage.Total + 1
        const visible = rootReply.ChildReplies.length
        rootReply.ChildPage = {
          ...rootReply.ChildPage,
          Total: total,
          HasMore: visible < total,
        }
      }
    } else {
      replyItems.value = [created, ...replyItems.value]
      thread.value.RepliesPage = {
        ...replyPagination.value,
        Total: replyPagination.value.Total + 1,
        HasMore: replyItems.value.length < replyPagination.value.Total + 1,
      }
    }

    thread.value.Replies += 1
    draftReply.value = ''
    replyTarget.value = null

    $q.notify({
      type: 'positive',
      message: '回复已发布',
    })
  } catch (err) {
    replyError.value = err instanceof Error ? err.message : '回复失败'
  } finally {
    submittingReply.value = false
  }
}

async function handleLoadMoreChildReplies(parentReplyId: number) {
  await loadMoreChildReplies(parentReplyId)
}

function handleLoadMoreReplies() {
  if (loadingMoreReplies.value || !replyPagination.value.HasMore) {
    return
  }

  void loadThread({ appendReplies: true })
}

const requestThread = useTimeoutFn(async () => {
  handledNotificationFocusKey.value = ''
  await loadThread()
})

useInitRequest(requestThread, { isActive })

watch(
  () => threadId.value,
  (current, previous) => {
    if (current === previous || !route.meta.reload) {
      return
    }

    void requestThread.syncCall()
  },
)

watch(
  () => notificationFocusKey.value,
  (current, previous) => {
    if (!current || current === previous || !route.meta.reload) {
      return
    }

    handledNotificationFocusKey.value = ''

    if (thread.value?.Id === threadId.value) {
      void loadThread({ trackView: false })
      return
    }

    void focusReplyFromNotification()
  },
)
</script>

<style scoped lang="scss">
.thread-page {
  min-height: 100%;
  padding: 26px 22px 40px;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.14), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #f8fafc 100%);
}

.thread-page__shell {
  max-width: 1360px;
  margin: 0 auto;
}

.thread-page__breadcrumbs {
  margin-bottom: 16px;
  color: #64748b;
}

.thread-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  align-items: start;
}

.thread-page__main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.thread-card,
.reply-panel,
.side-panel,
.thread-page__empty {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)), rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

.thread-card {
  padding: 24px 26px;
}

.thread-card__topline,
.thread-card__topline-meta,
.thread-card__meta,
.thread-card__stats,
.thread-card__tags,
.thread-card__actions,
.reply-item__header,
.reply-item__author,
.reply-item__name-row,
.reply-composer__actions,
.reply-item__tools,
.reply-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.thread-card__topline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
}

.thread-card__topline-meta,
.thread-card__actions--top {
  flex-wrap: nowrap;
}

.thread-card__topline-meta {
  min-width: 0;
  overflow: hidden;
}

.thread-card__board,
.thread-card__sub-category,
.thread-card__flag,
.thread-card__tag,
.reply-item__badge,
.reply-item__reply-to {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.thread-card__board {
  padding: 6px 11px;
  color: #2563eb;
  background: rgba(59, 130, 246, 0.08);
}

.thread-card__sub-category {
  padding: 6px 11px;
  color: #0f766e;
  background: rgba(20, 184, 166, 0.08);
}

.thread-card__flag {
  padding: 5px 10px;
  color: white;
}

.thread-card__flag--pinned {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.thread-card__flag--featured {
  background: linear-gradient(135deg, #f59e0b, #fb7185);
}

.thread-card__flag--locked {
  background: linear-gradient(135deg, #64748b, #475569);
}

.thread-card__title {
  margin: 16px 0 0;
  font-size: 36px;
  line-height: 1.15;
  color: #0f172a;
}

.thread-card__meta {
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.92);
}

.thread-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.community-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-item__header {
  justify-content: space-between;
  flex-wrap: nowrap;
}

.reply-item__author {
  min-width: 0;
}

.thread-card__author-name {
  color: #0f172a;
  font-weight: 700;
}

.thread-card__author-time,
.thread-card__stats {
  color: #64748b;
  font-size: 13px;
}

.thread-card__actions--top {
  justify-content: flex-end;
}

.thread-card__action-btn {
  border-radius: 999px;
  color: #2563eb;
  background: rgba(219, 234, 254, 0.84);
}

.thread-card__action-btn--active {
  color: white;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.thread-card__body {
  margin-top: 20px;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.9;
}

.thread-card__body p {
  margin: 0 0 16px;
}

.thread-card__tags {
  margin-top: 12px;
}

.thread-card__tag,
.reply-item__badge,
.reply-item__reply-to {
  padding: 5px 10px;
  color: #475569;
  background: rgba(226, 232, 240, 0.72);
}

.reply-panel {
  padding: 22px 24px;
}

.reply-panel__header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.reply-panel__header h2,
.side-panel h3 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.2;
}

.reply-panel__header span,
.related-item__meta,
.reply-item__time,
.reply-item__like-btn,
.reply-composer__hint,
.reply-panel__lock,
.reply-item__tool-btn {
  color: #64748b;
  font-size: 12px;
}

.reply-panel__lock {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.78);
}

.reply-composer {
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.9);
}

.reply-composer__target {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(219, 234, 254, 0.7);
  color: #1d4ed8;
  font-size: 12px;
}

.reply-composer__input {
  margin-bottom: 12px;
}

.reply-composer__actions {
  justify-content: space-between;
}

.reply-panel__error {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: #dc2626;
  font-size: 13px;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.reply-item {
  padding: 16px 0 0 0;
}

.reply-item + .reply-item {
  border-top: 1px solid rgba(226, 232, 240, 0.88);
}

.reply-item--focused,
.reply-child--focused {
  border-radius: 18px;
  background: rgba(219, 234, 254, 0.24);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.18);
}

.reply-item__name {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.reply-item__content {
  margin: 12px 0 0 46px;
  color: #334155;
  font-size: 14px;
  line-height: 1.8;
}

.reply-children {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 6px 0 0 46px;
  padding-left: 14px;
  border-left: 2px solid rgba(219, 234, 254, 0.9);
}

.reply-child {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.92);
}

.reply-item__reply-to--clickable {
  border: 0;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.reply-item__reply-to--clickable:hover,
.reply-item__reply-to--clickable:focus-visible {
  color: #1d4ed8;
  background: rgba(191, 219, 254, 0.95);
  transform: translateY(-1px);
  outline: none;
}

.reply-child__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.reply-child__content {
  margin: 10px 0 0 40px;
  color: #334155;
  font-size: 13px;
  line-height: 1.8;
}

.reply-children__footer {
  margin: 12px 0 0 46px;
}

.reply-item__like-btn,
.reply-item__tool-btn {
  border-radius: 999px;
}

.reply-item__like-btn--active {
  color: #2563eb;
  background: rgba(219, 234, 254, 0.72);
}

.reply-panel__footer {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.thread-page__aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 76px;
}

.side-panel {
  padding: 20px;
}

.side-panel__empty {
  margin-top: 14px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.related-item {
  display: block;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.92);
  transition: background-color 0.18s ease;
}

.related-item:hover {
  background: rgba(239, 246, 255, 0.96);
}

.related-item__title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
  display: -webkit-box;
  min-height: calc(1.6em * 2);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.thread-page__loading {
  padding: 20px;
}

.thread-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  text-align: center;
}

.thread-page__empty p {
  margin: 0 0 8px;
  color: #64748b;
}

@media (max-width: 1180px) {
  .thread-page__grid {
    grid-template-columns: 1fr;
  }

  .thread-page__aside {
    position: static;
  }

  .thread-card__meta,
  .reply-composer__actions,
  .reply-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .thread-card__actions--top {
    justify-content: flex-start;
  }

  .reply-item__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reply-child__header {
    flex-direction: column;
  }
}
</style>
