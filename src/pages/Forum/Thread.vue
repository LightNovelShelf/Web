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
          <q-breadcrumbs-el :label="thread.boardName" :to="{ name: 'ForumList' }" />
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
                    :aria-label="thread.favorited ? '已收藏' : '收藏'"
                    @click="toggleFavorite"
                  />
                  <q-btn
                    unelevated
                    class="thread-card__action-btn"
                    :class="{ 'thread-card__action-btn--active': thread.liked }"
                    :icon="thread.liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                    :label="`${thread.likes}`"
                    :aria-label="thread.liked ? '已点赞' : '点赞'"
                    @click="toggleThreadLike"
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
                <h2>回复</h2>
                <span>{{ thread.repliesPreview.length }} 条预览</span>
              </div>

              <div class="reply-composer">
                <q-input
                  v-model="draftReply"
                  autogrow
                  outlined
                  class="reply-composer__input"
                  placeholder="写下你的看法，补充观点或者回应楼主。"
                />
                <div class="reply-composer__actions">
                  <div class="reply-composer__hint">回复会先以本地预览形式展示，后续接真实接口再提交到后端。</div>
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="mdiSend"
                    label="发布回复"
                    :disable="!draftReply.trim()"
                    @click="submitReply"
                  />
                </div>
              </div>

              <div class="reply-list">
                <article v-for="reply in thread.repliesPreview" :key="reply.id" class="reply-item">
                  <div class="reply-item__header">
                    <div class="reply-item__author">
                      <q-avatar size="34px" :style="{ background: avatarBackground(reply.authorName), color: '#fff' }">
                        {{ reply.authorName.slice(0, 1) }}
                      </q-avatar>
                      <div>
                        <div class="reply-item__name-row">
                          <span class="reply-item__name">{{ reply.authorName }}</span>
                          <span v-if="reply.authorBadge" class="reply-item__badge">{{ reply.authorBadge }}</span>
                        </div>
                        <div class="reply-item__time">{{ reply.publishedAt }}</div>
                      </div>
                    </div>

                    <q-btn
                      flat
                      no-caps
                      dense
                      class="reply-item__like-btn"
                      :class="{ 'reply-item__like-btn--active': reply.liked }"
                      :icon="reply.liked ? 'mdiThumbUp' : 'mdiThumbUpOutline'"
                      :label="`${reply.likes}`"
                      @click="toggleReplyLike(reply.id)"
                    />
                  </div>

                  <p class="reply-item__content">{{ reply.content }}</p>
                </article>
              </div>
            </section>
          </main>

          <aside class="thread-page__aside">
            <section class="side-panel">
              <div class="side-panel__eyebrow">Back</div>
              <h3>继续浏览</h3>
              <q-btn unelevated no-caps color="primary" label="返回社区首页" :to="{ name: 'ForumList' }" />
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
        <p>这条帖子可能已经被删除，或者当前 mock 数据里还没有它。</p>
        <q-btn unelevated no-caps color="primary" label="返回社区首页" :to="{ name: 'ForumList' }" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import sanitizerHtml from 'src/utils/sanitizeHtml'

import HtmlReader from 'components/html/HtmlReader.vue'

import { getCommunityThreadDetail } from 'src/services/forum/communityHome'

import type { CommunityThreadDetail, CommunityThreadReply } from 'src/services/forum/types'

const props = defineProps<{ id: string }>()

const thread = ref<CommunityThreadDetail | null>(null)
const loading = ref(true)
const draftReply = ref('')

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}

async function loadThread() {
  loading.value = true
  draftReply.value = ''
  thread.value = await getCommunityThreadDetail(Number(props.id))
  loading.value = false
}

function toggleThreadLike() {
  if (!thread.value) {
    return
  }

  thread.value.liked = !thread.value.liked
  thread.value.likes += thread.value.liked ? 1 : -1
}

function toggleFavorite() {
  if (!thread.value) {
    return
  }

  thread.value.favorited = !thread.value.favorited
  thread.value.favorites += thread.value.favorited ? 1 : -1
}

function toggleReplyLike(replyId: number) {
  if (!thread.value) {
    return
  }

  const reply = thread.value.repliesPreview.find((item) => item.id === replyId)
  if (!reply) {
    return
  }

  reply.liked = !reply.liked
  reply.likes += reply.liked ? 1 : -1
}

function submitReply() {
  if (!thread.value || !draftReply.value.trim()) {
    return
  }

  const nextReply: CommunityThreadReply = {
    id: Date.now(),
    authorName: '你',
    authorBadge: '刚刚参与',
    publishedAt: '刚刚',
    content: draftReply.value.trim(),
    likes: 0,
    liked: false,
  }

  thread.value.repliesPreview = [nextReply, ...thread.value.repliesPreview]
  thread.value.replies += 1
  draftReply.value = ''
}

watch(
  () => props.id,
  () => {
    void loadThread()
  },
)

onMounted(() => {
  void loadThread()
})
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
.reply-composer__actions {
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
  flex-wrap: nowrap;
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
.reply-item__badge {
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
.reply-item__badge {
  padding: 5px 10px;
  color: #475569;
  background: rgba(226, 232, 240, 0.72);
}

.reply-panel {
  padding: 22px 24px;
}

.reply-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
.reply-composer__hint {
  color: #64748b;
  font-size: 12px;
}

.reply-composer {
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.9);
}

.reply-composer__input {
  margin-bottom: 12px;
}

.reply-composer__actions {
  justify-content: space-between;
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

.reply-item__like-btn {
  border-radius: 999px;
}

.reply-item__like-btn--active {
  color: #2563eb;
  background: rgba(219, 234, 254, 0.72);
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
  .reply-composer__actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .thread-card__actions--top {
    justify-content: flex-start;
  }
}
</style>
