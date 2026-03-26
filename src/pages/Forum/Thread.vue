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
          <q-breadcrumbs-el :label="thread.boardName" :to="{ name: 'ForumList', query: { board: thread.boardKey } }" />
          <q-breadcrumbs-el label="帖子详情" />
        </q-breadcrumbs>

        <div class="thread-page__grid">
          <main class="thread-page__main">
            <article class="thread-card">
              <div class="thread-card__topline">
                <div class="thread-card__topline-meta">
                  <span class="thread-card__board">{{ thread.boardName }}</span>
                  <span v-if="thread.pinned" class="thread-card__flag thread-card__flag--pinned">置顶</span>
                  <span v-if="thread.featured" class="thread-card__flag thread-card__flag--featured">精华</span>
                  <span v-if="thread.locked" class="thread-card__flag thread-card__flag--locked">已锁定</span>
                </div>

                <div class="thread-card__actions thread-card__actions--top">
                  <q-btn
                    unelevated
                    class="thread-card__action-btn"
                    :class="{ 'thread-card__action-btn--active': thread.favorited }"
                    :icon="thread.favorited ? 'mdiBookmark' : 'mdiBookmarkOutline'"
                    :label="`${thread.favorites}`"
                    :disable="thread.locked || togglingFavorite"
                    :loading="togglingFavorite"
                    :aria-label="thread.favorited ? '已收藏' : '收藏'"
                    @click="handleToggleFavorite"
                  />
                  <q-btn
                    unelevated
                    class="thread-card__action-btn"
                    :class="{ 'thread-card__action-btn--active': thread.liked }"
                    :icon="thread.liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                    :label="`${thread.likes}`"
                    :disable="thread.locked || togglingLike"
                    :loading="togglingLike"
                    :aria-label="thread.liked ? '已点赞' : '点赞'"
                    @click="handleToggleThreadLike"
                  />
                </div>
              </div>

              <h1 class="thread-card__title">{{ thread.title }}</h1>

              <div class="thread-card__meta">
                <div class="thread-card__author">
                  <q-avatar size="42px" :style="{ background: avatarBackground(thread.authorName), color: '#fff' }">
                    {{ thread.authorName.slice(0, 1) }}
                  </q-avatar>
                  <div>
                    <div class="thread-card__author-name">{{ thread.authorName }}</div>
                    <div class="thread-card__author-time">{{ thread.publishedAt }}</div>
                  </div>
                </div>

                <div class="thread-card__stats">
                  <span>评论 {{ thread.replies }}</span>
                  <span>浏览 {{ thread.views }}</span>
                  <span>热度 {{ thread.heat }}</span>
                </div>
              </div>

              <div class="thread-card__body">
                <html-reader :html="sanitizerHtml(thread.bodyHtml)" />
              </div>

              <div class="thread-card__tags">
                <span v-for="tag in thread.tags" :key="tag" class="thread-card__tag">{{ tag }}</span>
              </div>
            </article>

            <section class="reply-panel">
              <div class="reply-panel__header">
                <div>
                  <h2>回复</h2>
                  <span>当前已加载 {{ replyItems.length }} / {{ replyPagination.total }} 个楼层</span>
                </div>
                <div v-if="thread.locked" class="reply-panel__lock">当前帖子已锁定，只能浏览。</div>
              </div>

              <div ref="replyComposerRef" class="reply-composer">
                <div v-if="replyTarget" class="reply-composer__target">
                  正在回复 <strong>{{ replyTarget.authorName }}</strong>
                  <q-btn flat dense no-caps color="primary" label="取消" @click="replyTarget = null" />
                </div>

                <q-input
                  v-model="draftReply"
                  autogrow
                  outlined
                  class="reply-composer__input"
                  :disable="thread.locked"
                  :placeholder="replyPlaceholder"
                />

                <div class="reply-composer__actions">
                  <div class="reply-composer__hint">
                    {{ thread.locked ? '锁帖后不能继续回复。' : '支持回复楼主，也支持对某条回复发起二级回应。' }}
                  </div>
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="mdiSend"
                    label="发布回复"
                    :disable="thread.locked || !draftReply.trim()"
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
                  :id="replyDomId(reply.id)"
                  :key="reply.id"
                  class="reply-item"
                  :class="{ 'reply-item--focused': focusedReplyId === reply.id }"
                >
                  <div class="reply-item__header">
                    <div class="reply-item__author">
                      <q-avatar size="34px" :style="{ background: avatarBackground(reply.authorName), color: '#fff' }">
                        {{ reply.authorName.slice(0, 1) }}
                      </q-avatar>
                      <div>
                        <div class="reply-item__name-row">
                          <span class="reply-item__name">{{ reply.authorName }}</span>
                          <span v-if="reply.authorBadge" class="reply-item__badge">{{ reply.authorBadge }}</span>
                          <button
                            v-if="reply.replyTo"
                            type="button"
                            class="reply-item__reply-to reply-item__reply-to--clickable"
                            @click="scrollToReply(reply.replyTo.id)"
                          >
                            回复 {{ reply.replyTo.authorName }}
                          </button>
                        </div>
                        <div class="reply-item__time">{{ reply.publishedAt }}</div>
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
                        :disable="thread.locked"
                        @click="handleStartReply(reply.id, reply.authorName)"
                      />
                      <q-btn
                        flat
                        no-caps
                        dense
                        class="reply-item__like-btn"
                        :class="{ 'reply-item__like-btn--active': reply.liked }"
                        :icon="reply.liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                        :label="`${reply.likes}`"
                        :disable="thread.locked || togglingReplyIds.has(reply.id)"
                        @click="handleToggleReplyLike(reply.id)"
                      />
                    </div>
                  </div>

                  <p class="reply-item__content">{{ reply.content }}</p>

                  <div v-if="reply.childReplies.length" class="reply-children">
                    <article
                      v-for="child in reply.childReplies"
                      :id="replyDomId(child.id)"
                      :key="child.id"
                      class="reply-child"
                      :class="{ 'reply-child--focused': focusedReplyId === child.id }"
                    >
                      <div class="reply-child__header">
                        <div class="reply-item__author">
                          <q-avatar size="30px" :style="{ background: avatarBackground(child.authorName), color: '#fff' }">
                            {{ child.authorName.slice(0, 1) }}
                          </q-avatar>
                          <div>
                            <div class="reply-item__name-row">
                              <span class="reply-item__name">{{ child.authorName }}</span>
                              <span v-if="child.authorBadge" class="reply-item__badge">{{ child.authorBadge }}</span>
                              <button
                                v-if="child.replyTo"
                                type="button"
                                class="reply-item__reply-to reply-item__reply-to--clickable"
                                @click="scrollToReply(child.replyTo.id)"
                              >
                                回复 {{ child.replyTo.authorName }}
                              </button>
                            </div>
                            <div class="reply-item__time">{{ child.publishedAt }}</div>
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
                            :disable="thread.locked"
                            @click="handleStartReply(child.id, child.authorName)"
                          />
                          <q-btn
                            flat
                            no-caps
                            dense
                            class="reply-item__like-btn"
                            :class="{ 'reply-item__like-btn--active': child.liked }"
                            :icon="child.liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                            :label="`${child.likes}`"
                            :disable="thread.locked || togglingReplyIds.has(child.id)"
                            @click="handleToggleReplyLike(child.id)"
                          />
                        </div>
                      </div>

                      <p class="reply-child__content">{{ child.content }}</p>
                    </article>
                  </div>

                  <div v-if="reply.childPage.hasMore" class="reply-children__footer">
                    <q-btn
                      flat
                      no-caps
                      color="primary"
                      :loading="loadingChildReplyIds.has(reply.id)"
                      label="加载更多楼中楼"
                      @click="handleLoadMoreChildReplies(reply.id)"
                    />
                  </div>
                </article>
              </div>

              <div v-if="replyPagination.hasMore" class="reply-panel__footer">
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
              <div class="side-panel__eyebrow">Back</div>
              <h3>继续浏览</h3>
              <q-btn unelevated no-caps color="primary" label="返回社区首页" :to="{ name: 'ForumList', query: { board: thread.boardKey } }" />
            </section>

            <section class="side-panel">
              <div class="side-panel__eyebrow">Related</div>
              <h3>相关帖子</h3>
              <div class="related-list">
                <router-link
                  v-for="item in thread.relatedThreads"
                  :key="item.id"
                  class="related-item"
                  :to="{ name: 'ForumThread', params: { id: item.id } }"
                >
                  <div class="related-item__title">{{ item.title }}</div>
                  <div class="related-item__meta">{{ item.boardName }} · 评论 {{ item.replies }}</div>
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

import { useAppStore } from 'stores/app'

import HtmlReader from 'components/html/HtmlReader.vue'

import {
  createCommunityReply,
  getCommunityReplyChildren,
  getCommunityThread,
  toggleReplyLike,
  toggleThreadFavorite,
  toggleThreadLike,
} from 'src/services/forum'

import type { CommunityPagination, CommunityReplyTarget, CommunityThreadDetail, CommunityThreadReply } from 'src/services/forum'

const props = defineProps<{ id: string }>()

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

const emptyPagination: CommunityPagination = {
  page: 1,
  size: 5,
  total: 0,
  totalPages: 1,
  hasMore: false,
}

const replyPagination = computed(() => thread.value?.repliesPage ?? emptyPagination)
const focusedReplyId = ref<number | null>(null)
const replyPlaceholder = computed(() => {
  if (thread.value?.locked) {
    return '当前帖子已锁定'
  }

  if (replyTarget.value) {
    return `回复 ${replyTarget.value.authorName}...`
  }

  return '写下你的看法，补充观点或者回应楼主。'
})

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}

function requireLogin() {
  if (user.value) {
    return true
  }

  $q.notify({
    type: 'warning',
    message: '请先登录后再参与讨论',
  })
  void router.push({ name: 'Login', query: { redirect: route.fullPath } })
  return false
}

function resolveAuthorName() {
  return user.value?.UserName || user.value?.Name || '你'
}

function findReplyById(replyId: number) {
  for (const reply of replyItems.value) {
    if (reply.id === replyId) {
      return reply
    }

    const child = reply.childReplies.find((item) => item.id === replyId)
    if (child) {
      return child
    }
  }

  return undefined
}

function findRootReply(replyId: number) {
  for (const reply of replyItems.value) {
    if (reply.id === replyId || reply.childReplies.some((item) => item.id === replyId)) {
      return reply
    }
  }

  return undefined
}

async function handleStartReply(replyId: number, authorName: string) {
  replyTarget.value = { id: replyId, authorName }

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

  const target = replyItems.value.find((item) => item.id === parentReplyId)
  if (!target || !target.childPage.hasMore) {
    return false
  }

  loadingChildReplyIds.value = new Set(loadingChildReplyIds.value).add(parentReplyId)

  try {
    const next = await getCommunityReplyChildren({
      threadId: thread.value.id,
      parentReplyId,
      page: target.childPage.page + 1,
      size: target.childPage.size,
    })

    target.childReplies = [...target.childReplies, ...next.items]
    target.childPage = next.page
    return true
  } finally {
    const nextIds = new Set(loadingChildReplyIds.value)
    nextIds.delete(parentReplyId)
    loadingChildReplyIds.value = nextIds
  }
}

async function ensureReplyVisible(replyId: number) {
  if (findReplyById(replyId)) {
    return true
  }

  while (thread.value?.repliesPage.hasMore) {
    await loadThread({ appendReplies: true, trackView: false })
    if (findReplyById(replyId)) {
      return true
    }
  }

  for (const reply of replyItems.value) {
    while (reply.childPage.hasMore) {
      await loadMoreChildReplies(reply.id)
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

async function scrollToReply(replyId: number) {
  if (!thread.value) {
    return
  }

  const visible = await ensureReplyVisible(replyId)
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

async function loadThread(options: { appendReplies?: boolean, trackView?: boolean } = {}) {
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

  const data = await getCommunityThread(Number(props.id), nextReplyPage, undefined, {
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
  replyItems.value = appendReplies ? [...replyItems.value, ...data.replyItems] : data.replyItems
  loading.value = false
  loadingMoreReplies.value = false
}

async function handleToggleThreadLike() {
  if (!thread.value || thread.value.locked || !requireLogin()) {
    return
  }

  togglingLike.value = true
  try {
    const nextState = await toggleThreadLike(thread.value.id)
    thread.value.liked = nextState.liked
    thread.value.likes = nextState.likes
  } finally {
    togglingLike.value = false
  }
}

async function handleToggleFavorite() {
  if (!thread.value || thread.value.locked || !requireLogin()) {
    return
  }

  togglingFavorite.value = true
  try {
    const nextState = await toggleThreadFavorite(thread.value.id)
    thread.value.favorited = nextState.favorited
    thread.value.favorites = nextState.favorites
  } finally {
    togglingFavorite.value = false
  }
}

async function handleToggleReplyLike(replyId: number) {
  if (!thread.value || thread.value.locked || !requireLogin()) {
    return
  }

  togglingReplyIds.value = new Set(togglingReplyIds.value).add(replyId)

  try {
    const nextState = await toggleReplyLike(thread.value.id, replyId)
    const target = findReplyById(replyId)
    if (target) {
      target.liked = nextState.liked
      target.likes = nextState.likes
    }
  } finally {
    const nextIds = new Set(togglingReplyIds.value)
    nextIds.delete(replyId)
    togglingReplyIds.value = nextIds
  }
}

async function handleSubmitReply() {
  if (!thread.value || thread.value.locked || !draftReply.value.trim() || !requireLogin()) {
    return
  }

  submittingReply.value = true
  replyError.value = ''

  try {
    const created = await createCommunityReply({
      threadId: thread.value.id,
      content: draftReply.value,
      authorName: resolveAuthorName(),
      replyToId: replyTarget.value?.id,
    })

    if (replyTarget.value) {
      const rootReply = findRootReply(replyTarget.value.id)
      if (rootReply) {
        rootReply.childReplies = [...rootReply.childReplies, created]
        const total = rootReply.childPage.total + 1
        const visible = rootReply.childReplies.length
        rootReply.childPage = {
          ...rootReply.childPage,
          total,
          hasMore: visible < total,
        }
      }
    } else {
      replyItems.value = [created, ...replyItems.value]
      thread.value.repliesPage = {
        ...replyPagination.value,
        total: replyPagination.value.total + 1,
        hasMore: replyItems.value.length < replyPagination.value.total + 1,
      }
    }

    thread.value.replies += 1
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
  if (loadingMoreReplies.value || !replyPagination.value.hasMore) {
    return
  }

  void loadThread({ appendReplies: true })
}

watch(
  () => props.id,
  () => {
    void loadThread()
  },
  { immediate: true },
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
.side-panel__eyebrow,
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
  padding: 16px 0;
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
  margin: 14px 0 0 46px;
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

.side-panel__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
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
