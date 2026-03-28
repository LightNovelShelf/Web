<template>
  <q-page :class="['community-mine', { 'community-mine--dark': $q.dark.isActive }]">
    <div class="community-mine__shell">
      <section class="community-mine__hero">
        <div>
          <div class="community-mine__eyebrow">个人概览</div>
          <h1 class="community-mine__title">{{ overview?.AuthorName || '我的社区' }}</h1>
          <p class="community-mine__subtitle">查看你最近发布的话题、参与过的回复，以及收藏中的帖子。</p>
        </div>

        <div class="community-mine__actions">
          <q-btn flat no-caps color="primary" icon="mdiForum" label="返回社区首页" :to="{ name: 'ForumList' }" />
        </div>
      </section>

      <div v-if="loading" class="community-mine__section-list">
        <section v-for="index in 3" :key="index" class="community-mine__section">
          <q-skeleton type="text" width="22%" />
          <q-skeleton type="text" width="55%" class="q-mt-sm" />
          <q-skeleton type="rect" height="120px" class="q-mt-md" />
        </section>
      </div>

      <div v-else-if="error" class="community-mine__state">
        <q-icon name="mdiAlertCircleOutline" size="42px" color="negative" />
        <div class="community-mine__state-title">加载失败</div>
        <div class="community-mine__state-text">{{ error }}</div>
        <q-btn unelevated no-caps color="primary" label="重试" @click="loadOverview" />
      </div>

      <div v-else-if="overview" class="community-mine__section-list">
        <section class="community-mine__section">
          <div class="community-mine__section-header">
            <div>
              <h2>我发布的帖子</h2>
              <p>共 {{ overview.PublishedThreads.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.PublishedThreads.length" class="community-mine__cards">
            <community-thread-card v-for="item in overview.PublishedThreads" :key="item.Id" :item="item" />
          </div>
          <div v-else class="community-mine__empty">你还没有发布过帖子。</div>
        </section>

        <section class="community-mine__section">
          <div class="community-mine__section-header">
            <div>
              <h2>我参与过的回复</h2>
              <p>共 {{ overview.ParticipatedReplies.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.ParticipatedReplies.length" class="community-mine__reply-list">
            <router-link
              v-for="item in overview.ParticipatedReplies"
              :key="item.Id"
              class="community-mine__reply-card"
              :to="{ name: 'ForumThread', params: { id: item.ThreadId } }"
            >
              <div class="community-mine__reply-title">{{ item.ThreadTitle }}</div>
              <div class="community-mine__reply-content">{{ item.Content }}</div>
              <div class="community-mine__reply-meta">
                <span>{{ item.BoardName }}</span>
                <span>{{ formatPublishedAt(item.PublishedAt) }}</span>
                <span>点赞 {{ item.Likes }}</span>
                <span v-if="item.ReplyToName">回复 {{ item.ReplyToName }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="community-mine__empty">你还没有参与过社区回复。</div>
        </section>

        <section class="community-mine__section">
          <div class="community-mine__section-header">
            <div>
              <h2>我的收藏</h2>
              <p>共 {{ overview.FavoriteThreads.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.FavoriteThreads.length" class="community-mine__cards">
            <community-thread-card v-for="item in overview.FavoriteThreads" :key="item.Id" :item="item" />
          </div>
          <div v-else class="community-mine__empty">你还没有收藏帖子。</div>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

import { parseTime, toNow } from 'src/utils/time'

import { useInitRequest } from 'src/composition/biz/useInitRequest'

import { getMyCommunityOverview } from 'src/services/forum'

import type { CommunityMyOverview } from 'src/services/forum'

import CommunityThreadCard from './List/components/CommunityThreadCard.vue'

const $q = useQuasar()
const loading = ref(true)
const error = ref('')
const overview = ref<CommunityMyOverview>()

function formatPublishedAt(value: string) {
  return toNow(parseTime(value))
}

async function loadOverview() {
  loading.value = true
  error.value = ''

  try {
    overview.value = await getMyCommunityOverview()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '请稍后再试'
  } finally {
    loading.value = false
  }
}

useInitRequest(loadOverview)
</script>

<style scoped lang="scss">
.community-mine {
  --community-accent: #2563eb;
  --community-text: #0f172a;
  --community-text-soft: #64748b;
  --community-card-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)), rgba(255, 255, 255, 0.96);
  --community-card-bg-soft: rgba(248, 250, 252, 0.92);
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

.community-mine--dark {
  --community-accent: #60a5fa;
  --community-text: #e2e8f0;
  --community-text-soft: #94a3b8;
  --community-card-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.9)), rgba(15, 23, 42, 0.92);
  --community-card-bg-soft: rgba(15, 23, 42, 0.84);
  --community-border: rgba(148, 163, 184, 0.16);
  --community-border-strong: rgba(96, 165, 250, 0.34);
  --community-shadow: 0 24px 60px rgba(2, 6, 23, 0.38);
  --community-hover-bg: rgba(30, 41, 59, 0.94);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.2), transparent 24%),
    linear-gradient(180deg, #020617 0%, #0f172a 48%, #111827 100%);
}

.community-mine__shell {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.community-mine__hero,
.community-mine__section,
.community-mine__state {
  border: 1px solid var(--community-border);
  border-radius: 24px;
  background: var(--community-card-bg);
  box-shadow: var(--community-shadow);
}

.community-mine__hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 26px 28px;
}

.community-mine__eyebrow {
  color: var(--community-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.community-mine__title {
  margin: 8px 0 0;
  color: var(--community-text);
  font-size: 36px;
  line-height: 1.1;
}

.community-mine__subtitle,
.community-mine__section-header p,
.community-mine__reply-meta,
.community-mine__state-text,
.community-mine__empty {
  color: var(--community-text-soft);
  font-size: 13px;
  line-height: 1.7;
}

.community-mine__section-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.community-mine__section {
  padding: 22px 24px;
}

.community-mine__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.community-mine__section-header h2 {
  margin: 0;
  color: var(--community-text);
  font-size: 24px;
}

.community-mine__section-header p {
  margin: 8px 0 0;
}

.community-mine__cards,
.community-mine__reply-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.community-mine__reply-card {
  display: block;
  padding: 16px 18px;
  border-radius: 18px;
  background: var(--community-card-bg-soft);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.community-mine__reply-card:hover,
.community-mine__reply-card:focus-visible {
  transform: translateY(-1px);
  background: var(--community-hover-bg);
  box-shadow: inset 0 0 0 1px var(--community-border-strong);
}

.community-mine__reply-title {
  color: var(--community-text);
  font-size: 15px;
  font-weight: 700;
}

.community-mine__reply-content {
  margin-top: 8px;
  color: var(--community-text-soft);
  font-size: 14px;
  line-height: 1.8;
}

.community-mine__reply-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.community-mine__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 52px 24px;
  text-align: center;
}

.community-mine__state-title {
  color: var(--community-text);
  font-size: 20px;
  font-weight: 700;
}

.community-mine__empty {
  padding: 10px 2px 2px;
}

@media (max-width: 900px) {
  .community-mine__hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
