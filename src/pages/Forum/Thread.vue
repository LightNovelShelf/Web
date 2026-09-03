<template>
  <q-page :class="['thread-page', { 'thread-page--dark': $q.dark.isActive }]">
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

                  <q-btn
                    v-if="thread.CanEdit"
                    unelevated
                    class="thread-card__action-btn"
                    icon="mdiDotsHorizontal"
                    aria-label="更多操作"
                  >
                    <q-menu anchor="bottom right" self="top right">
                      <q-list dense class="thread-card__menu">
                        <q-item v-close-popup clickable :to="{ name: 'ForumThreadEdit', params: { id: thread.Id } }">
                          <q-item-section>
                            <div class="thread-card__menu-item">
                              <q-icon name="mdiPen" size="17px" />
                              编辑
                            </div>
                          </q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable :disable="deleting" @click="handleDeleteThread">
                          <q-item-section>
                            <div class="thread-card__menu-item">
                              <q-icon name="mdiDelete" size="17px" />
                              删除
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>

              <h1 class="thread-card__title">{{ thread.Title }}</h1>

              <div class="thread-card__meta">
                <div class="thread-card__author">
                  <user-avatar
                    :user="{
                      Id: thread.AuthorId,
                      UserName: thread.AuthorName,
                      Avatar: thread.AuthorAvatar,
                    }"
                    :disabled="thread.AuthorIsDeleted"
                    size="42px"
                  />
                  <div>
                    <div class="thread-card__author-name">
                      {{ thread.AuthorName }}
                      <span v-if="thread.AuthorIsDeleted" class="text-negative">（被封禁）</span>
                    </div>
                    <div class="thread-card__author-time">
                      <time-ago :value="thread.PublishedAt" />
                      <template v-if="thread.EditedAt">
                        •&nbsp;修改于
                        <time-ago :value="thread.EditedAt" />
                      </template>
                    </div>
                  </div>
                </div>

                <div class="thread-card__stats">
                  <span>评论 {{ thread.Replies }}</span>
                  <span>浏览 {{ thread.Views }}</span>
                  <span>热度 {{ thread.Heat }}</span>
                </div>
              </div>

              <div class="thread-card__body">
                <html-reader :html="sanitizerHtml(thread.Content)" />
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
                  正在回复
                  <strong>{{ replyTarget.AuthorName }}</strong>
                  <strong v-if="replyTarget.AuthorIsDeleted" class="text-negative">（被封禁）</strong>
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
                      <user-avatar
                        :user="{
                          Id: reply.AuthorId,
                          UserName: reply.AuthorName,
                          Avatar: reply.AuthorAvatar,
                        }"
                        :disabled="reply.AuthorIsDeleted"
                        size="34px"
                      />
                      <div>
                        <div class="reply-item__name-row">
                          <span class="reply-item__name">
                            {{ reply.AuthorName }}
                            <span v-if="reply.AuthorIsDeleted" class="text-negative">（被封禁）</span>
                          </span>
                          <span v-if="reply.AuthorBadge" class="reply-item__badge">{{ reply.AuthorBadge }}</span>
                          <button
                            v-if="reply.ReplyTo"
                            type="button"
                            class="reply-item__reply-to reply-item__reply-to--clickable"
                            @click="scrollToReply(reply.ReplyTo.Id)"
                          >
                            回复 {{ reply.ReplyTo.AuthorName
                            }}<span v-if="reply.ReplyTo.AuthorIsDeleted" class="text-negative">（被封禁）</span>
                          </button>
                        </div>
                        <time-ago class="reply-item__time" :value="reply.PublishedAt" />
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
                        @click="handleStartReply(reply.Id, reply.AuthorName, reply.AuthorIsDeleted)"
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
                      <q-btn
                        v-if="reply.CanDelete"
                        flat
                        no-caps
                        dense
                        class="reply-item__tool-btn"
                        icon="mdiDelete"
                        aria-label="删除回复"
                        :disable="deletingReplyIds.has(reply.Id)"
                        @click="handleDeleteReply(reply.Id)"
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
                          <user-avatar
                            :user="{
                              Id: child.AuthorId,
                              UserName: child.AuthorName,
                              Avatar: child.AuthorAvatar,
                            }"
                            :disabled="child.AuthorIsDeleted"
                            size="30px"
                          />
                          <div>
                            <div class="reply-item__name-row">
                              <span class="reply-item__name">
                                {{ child.AuthorName }}
                                <span v-if="child.AuthorIsDeleted" class="text-negative">（被封禁）</span>
                              </span>
                              <span v-if="child.AuthorBadge" class="reply-item__badge">{{ child.AuthorBadge }}</span>
                              <button
                                v-if="child.ReplyTo"
                                type="button"
                                class="reply-item__reply-to reply-item__reply-to--clickable"
                                @click="scrollToReply(child.ReplyTo.Id)"
                              >
                                回复 {{ child.ReplyTo.AuthorName
                                }}<span v-if="child.ReplyTo.AuthorIsDeleted" class="text-negative">（被封禁）</span>
                              </button>
                            </div>
                            <time-ago class="reply-item__time" :value="child.PublishedAt" />
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
                            @click="handleStartReply(child.Id, child.AuthorName, child.AuthorIsDeleted)"
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
                          <q-btn
                            v-if="child.CanDelete"
                            flat
                            no-caps
                            dense
                            class="reply-item__tool-btn"
                            icon="mdiDelete"
                            aria-label="删除回复"
                            :disable="deletingReplyIds.has(child.Id)"
                            @click="handleDeleteReply(child.Id)"
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
                  <div class="related-item__meta">
                    {{ item.boardName }} ·
                    <time-ago :value="item.viewedAt" />
                  </div>
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
        <p>{{ loadError || '这条帖子可能已经被删除。' }}</p>
        <q-btn unelevated no-caps color="primary" label="返回社区首页" :to="{ name: 'ForumList' }" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'

import sanitizerHtml from '@/utils/sanitizeHtml'

import { useAppStore } from '@/stores/app'

import HtmlReader from '@/components/html/HtmlReader.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import UserAvatar from '@/components/UserAvatar.vue'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import {
  createCommunityReply,
  deleteCommunityReply,
  deleteCommunityThread,
  getCommunityReplyChildren,
  getCommunityThread,
  toggleReplyLike,
  toggleThreadFavorite,
  toggleThreadLike,
} from '@/services/forum'

import type {
  CommunityPagination,
  CommunityReplyTarget,
  CommunityThreadDetail,
  CommunityThreadReply,
} from '@/services/forum'

const props = defineProps<{ id: string }>()
const RECENT_THREAD_STORAGE_KEY = 'community.recentThreads'
const RECENT_THREAD_LIMIT = 6

interface RecentThreadHistoryItem {
  id: number
  title: string
  boardName: string
  viewedAt: number
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
const deleting = ref(false)
const togglingReplyIds = ref<Set<number>>(new Set())
const deletingReplyIds = ref<Set<number>>(new Set())
const submittingReply = ref(false)
const draftReply = ref('')
const loadError = ref('')
const replyError = ref('')
const replyPage = ref(1)
const replyTarget = ref<CommunityReplyTarget | null>(null)
const replyComposerRef = ref<HTMLElement | null>(null)
const recentThreadItems = ref<RecentThreadHistoryItem[]>([])

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
const notificationFocusKey = computed(() =>
  notificationReplyId.value ? `${props.id}:${notificationReplyId.value}` : '',
)
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

async function handleStartReply(replyId: number, authorName: string, authorIsDeleted: boolean) {
  replyTarget.value = { Id: replyId, AuthorName: authorName, AuthorIsDeleted: authorIsDeleted }

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
      // 锚点窗口不对齐页网格，拿已加载的最后一条当游标才不会重复或断档
      afterReplyId: target.ChildReplies.at(-1)?.Id,
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

function focusReply(replyId: number) {
  focusedReplyId.value = replyId

  window.setTimeout(() => {
    if (focusedReplyId.value === replyId) {
      focusedReplyId.value = null
    }
  }, 2600)
}

function scrollToReply(replyId: number) {
  document.getElementById(replyDomId(replyId))?.scrollIntoView({
    // 通知跳转是定位不是过渡，直接跳到锚点；smooth 在后台标签页会被浏览器冻结
    behavior: 'auto',
    block: 'center',
  })
  focusReply(replyId)
}

function focusReplyFromNotification(focus: CommunityThreadDetail['Focus']) {
  if (!focus || handledNotificationFocusKey.value === notificationFocusKey.value) {
    return
  }

  scrollToReply(focus.ReplyId)
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
    // 每页都带锚点：服务端把它所在楼层置顶在第一页、后续页跳过，翻页才不会重复
    focusReplyId: notificationReplyId.value ?? undefined,
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

  loading.value = false
  loadingMoreReplies.value = false

  // v-if=loading 与列表互斥，必须先关骨架屏再等一帧，列表 DOM 才存在
  await nextTick()
  if (!appendReplies) {
    focusReplyFromNotification(data.Focus)
  }
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

function handleDeleteThread() {
  if (!thread.value || deleting.value) {
    return
  }

  const threadId = thread.value.Id

  $q.dialog({
    title: '提示',
    message: '你确定要删除这个帖子吗？',
    ok: { label: '删除', color: 'negative', unelevated: true, noCaps: true },
    cancel: { label: '取消', color: 'grey-7', flat: true, noCaps: true },
  }).onOk(async () => {
    deleting.value = true

    try {
      await deleteCommunityThread(threadId)
      $q.notify({ type: 'positive', message: '帖子已删除' })
      await router.replace({ name: 'ForumList' })
    } catch (err) {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '删除失败' })
    } finally {
      deleting.value = false
    }
  })
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

function handleDeleteReply(replyId: number) {
  if (!thread.value || deletingReplyIds.value.has(replyId)) {
    return
  }

  $q.dialog({
    title: '提示',
    message: '你确定要删除这条回复吗？',
    ok: { label: '删除', color: 'negative', unelevated: true, noCaps: true },
    cancel: { label: '取消', color: 'grey-7', flat: true, noCaps: true },
  }).onOk(async () => {
    deletingReplyIds.value = new Set(deletingReplyIds.value).add(replyId)

    try {
      const res = await deleteCommunityReply(replyId)
      removeReplyFromList(replyId, res.Removed)
      $q.notify({ type: 'positive', message: '回复已删除' })
    } catch (err) {
      $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '删除失败' })
    } finally {
      const nextIds = new Set(deletingReplyIds.value)
      nextIds.delete(replyId)
      deletingReplyIds.value = nextIds
    }
  })
}

// 楼层删掉时它的子回复一起没了，服务端返回的 Removed 就是这次少掉的回复总数
function removeReplyFromList(replyId: number, removed: number) {
  const rootIndex = replyItems.value.findIndex((item) => item.Id === replyId)

  if (rootIndex >= 0) {
    replyItems.value.splice(rootIndex, 1)
  } else {
    const parent = findRootReply(replyId)
    if (parent) {
      parent.ChildReplies = parent.ChildReplies.filter((item) => item.Id !== replyId)
      parent.ChildPage = { ...parent.ChildPage, Total: Math.max(0, parent.ChildPage.Total - 1) }
    }
  }

  if (!thread.value) {
    return
  }

  const total = Math.max(0, replyPagination.value.Total - (rootIndex >= 0 ? 1 : 0))
  thread.value.Replies = Math.max(0, thread.value.Replies - removed)
  thread.value.RepliesPage = {
    ...replyPagination.value,
    Total: total,
    HasMore: replyItems.value.length < total,
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
  () => {
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
    void loadThread({ trackView: false })
  },
)
</script>

<style scoped lang="scss">
.thread-page {
  --community-accent: #2563eb;
  --community-text: #0f172a;
  --community-text-soft: #64748b;
  --community-card-bg:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)), rgba(255, 255, 255, 0.96);
  --community-card-bg-soft: rgba(248, 250, 252, 0.92);
  --community-chip-bg: rgba(226, 232, 240, 0.72);
  --community-border: rgba(148, 163, 184, 0.18);
  --community-border-strong: rgba(59, 130, 246, 0.3);
  --community-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
  --community-hover-bg: rgba(239, 246, 255, 0.96);
  min-height: 100%;
  padding: 26px 22px 40px;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.14), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #f8fafc 100%);
}

.thread-page--dark {
  --community-accent: #60a5fa;
  --community-text: #e2e8f0;
  --community-text-soft: #94a3b8;
  --community-card-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.9)), rgba(15, 23, 42, 0.92);
  --community-card-bg-soft: rgba(15, 23, 42, 0.84);
  --community-chip-bg: rgba(51, 65, 85, 0.76);
  --community-border: rgba(148, 163, 184, 0.16);
  --community-border-strong: rgba(96, 165, 250, 0.34);
  --community-shadow: 0 24px 60px rgba(2, 6, 23, 0.38);
  --community-hover-bg: rgba(30, 41, 59, 0.94);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.2), transparent 24%),
    linear-gradient(180deg, #020617 0%, #0f172a 48%, #111827 100%);
}

:deep(.thread-card__body) {
  p {
    text-indent: unset;
  }
}

.thread-card__menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thread-page__shell {
  max-width: 1360px;
  margin: 0 auto;
}

.thread-page__breadcrumbs {
  margin-bottom: 16px;
  color: var(--community-text-soft);
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
  border: 1px solid var(--community-border);
  border-radius: 24px;
  background: var(--community-card-bg);
  box-shadow: var(--community-shadow);
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

.reply-item__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  justify-content: stretch;
}

.reply-item__author,
.reply-item__author > div,
.reply-item__name-row {
  min-width: 0;
}

.reply-item__author {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  justify-content: start;
  align-items: start;
}

.reply-item__tools {
  flex-wrap: nowrap;
  margin-left: 0;
  justify-self: end;
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
  color: var(--community-accent);
  background: var(--community-chip-bg);
}

.thread-card__sub-category {
  padding: 6px 11px;
  color: var(--community-text-soft);
  background: var(--community-chip-bg);
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
  color: var(--community-text);
}

.thread-card__meta {
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--community-border);
}

.thread-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-item__header {
  justify-content: space-between;
  flex-wrap: nowrap;
}

.reply-item__author {
  min-width: 0;
}

.thread-card__author-name {
  color: var(--community-text);
  font-weight: 700;
}

.thread-card__author-time,
.thread-card__stats {
  color: var(--community-text-soft);
  font-size: 13px;
}

.thread-card__actions--top {
  justify-content: flex-end;
}

.thread-card__action-btn {
  border-radius: 999px;
  color: var(--community-accent);
  background: var(--community-chip-bg);
}

.thread-card__action-btn--active {
  color: white;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.thread-card__body {
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.9;
}

.thread-card__tags {
  margin-top: 12px;
}

.thread-card__tag,
.reply-item__badge,
.reply-item__reply-to {
  padding: 5px 10px;
  color: var(--community-text-soft);
  background: var(--community-chip-bg);
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
  color: var(--community-text);
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
  color: var(--community-text-soft);
  font-size: 12px;
}

.reply-panel__lock {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--community-chip-bg);
}

.reply-composer {
  padding: 16px;
  border: 1px solid var(--community-border);
  border-radius: 20px;
  background: var(--community-card-bg-soft);
}

.reply-composer__target {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 14px;
  background: var(--community-chip-bg);
  color: var(--community-accent);
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
  border-top: 1px solid var(--community-border);
}

.reply-item--focused,
.reply-child--focused {
  border-radius: 18px;
  background: var(--community-hover-bg);
  box-shadow: inset 0 0 0 1px var(--community-border-strong);
}

.reply-item__name {
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
}

.reply-item__content {
  margin: 12px 0 0 46px;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reply-children {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 6px 0 0 46px;
  padding-left: 14px;
  border-left: 2px solid var(--community-border-strong);
}

.reply-child {
  padding: 12px 0 12px 14px;
  border-radius: 16px;
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
  color: var(--community-accent);
  background: var(--community-hover-bg);
  transform: translateY(-1px);
  outline: none;
}

.reply-child__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
}

.reply-child__content {
  margin: 10px 0 0 40px;
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reply-children__footer {
  margin: 12px 0 0 46px;
}

.reply-item__like-btn,
.reply-item__tool-btn {
  border-radius: 999px;
}

.reply-item__like-btn--active {
  color: var(--community-accent);
  background: var(--community-chip-bg);
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
  color: var(--community-text-soft);
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
  background: var(--community-card-bg-soft);
  transition: background-color 0.18s ease;
}

.related-item:hover {
  background: var(--community-hover-bg);
}

.related-item__title {
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
  display: -webkit-box;
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
  color: var(--community-text-soft);
}

@media (max-width: 1199px) {
  .thread-page__grid {
    grid-template-columns: 1fr;
  }

  .thread-page__aside {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .thread-page {
    padding: 14px 12px 24px;
  }

  .thread-page__breadcrumbs {
    margin-bottom: 12px;
  }

  .thread-page__grid,
  .thread-page__main {
    gap: 12px;
  }

  .thread-card,
  .reply-panel,
  .side-panel,
  .thread-page__empty {
    border-radius: 20px;
  }

  .thread-card {
    padding: 18px 16px;
  }

  .thread-card__topline {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .thread-card__topline-meta {
    flex-wrap: wrap;
    overflow: visible;
  }

  .thread-card__actions--top {
    justify-content: flex-start;
  }

  .thread-card__title {
    margin-top: 14px;
    font-size: 27px;
    line-height: 1.2;
  }

  .thread-card__meta,
  .reply-composer__actions,
  .reply-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .reply-item__header,
  .reply-child__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .reply-item__tools {
    justify-content: flex-end;
    justify-self: end;
  }

  .thread-card__body {
    margin-top: 20px;
    padding-top: 18px;
  }

  .reply-panel {
    padding: 18px 16px;
  }

  .reply-composer {
    padding: 13px;
    border-radius: 17px;
  }

  .reply-composer__actions .q-btn {
    width: 100%;
  }

  .reply-item__content {
    margin-left: 0;
  }

  .reply-children {
    margin-left: 0;
    padding-left: 9px;
  }

  .reply-child {
    padding: 11px 0 11px 10px;
  }

  .reply-child__content {
    margin-left: 0;
  }

  .reply-children__footer {
    margin-left: 0;
  }

  .thread-page__aside {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
