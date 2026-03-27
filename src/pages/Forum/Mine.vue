<template>
  <q-page class="community-mine">
    <div class="community-mine__shell">
      <section class="community-mine__hero">
        <div>
          <div class="community-mine__eyebrow">个人概览</div>
          <h1 class="community-mine__title">{{ overview?.authorName || '我的社区' }}</h1>
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
              <p>共 {{ overview.publishedThreads.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.publishedThreads.length" class="community-mine__cards">
            <community-thread-card v-for="item in overview.publishedThreads" :key="item.id" :item="item" />
          </div>
          <div v-else class="community-mine__empty">你还没有发布过帖子。</div>
        </section>

        <section class="community-mine__section">
          <div class="community-mine__section-header">
            <div>
              <h2>我参与过的回复</h2>
              <p>共 {{ overview.participatedReplies.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.participatedReplies.length" class="community-mine__reply-list">
            <router-link
              v-for="item in overview.participatedReplies"
              :key="item.id"
              class="community-mine__reply-card"
              :to="{ name: 'ForumThread', params: { id: item.threadId } }"
            >
              <div class="community-mine__reply-title">{{ item.threadTitle }}</div>
              <div class="community-mine__reply-content">{{ item.content }}</div>
              <div class="community-mine__reply-meta">
                <span>{{ item.boardName }}</span>
                <span>{{ item.publishedAt }}</span>
                <span>点赞 {{ item.likes }}</span>
                <span v-if="item.replyToName">回复 {{ item.replyToName }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="community-mine__empty">你还没有参与过社区回复。</div>
        </section>

        <section class="community-mine__section">
          <div class="community-mine__section-header">
            <div>
              <h2>我的收藏</h2>
              <p>共 {{ overview.favoriteThreads.length }} 条</p>
            </div>
          </div>

          <div v-if="overview.favoriteThreads.length" class="community-mine__cards">
            <community-thread-card v-for="item in overview.favoriteThreads" :key="item.id" :item="item" />
          </div>
          <div v-else class="community-mine__empty">你还没有收藏帖子。</div>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { getMyCommunityOverview } from 'src/services/forum'

import type { CommunityMyOverview } from 'src/services/forum'

import CommunityThreadCard from './List/components/CommunityThreadCard.vue'

const loading = ref(true)
const error = ref('')
const overview = ref<CommunityMyOverview>()

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

onMounted(() => {
  void loadOverview()
})
</script>

<style scoped lang="scss">
.community-mine {
  min-height: 100%;
  padding: 26px 22px 40px;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.14), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #f8fafc 100%);
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)), rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

.community-mine__hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 26px 28px;
}

.community-mine__eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.community-mine__title {
  margin: 8px 0 0;
  color: #0f172a;
  font-size: 36px;
  line-height: 1.1;
}

.community-mine__subtitle,
.community-mine__section-header p,
.community-mine__reply-meta,
.community-mine__state-text,
.community-mine__empty {
  color: #64748b;
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
  color: #0f172a;
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
  background: rgba(248, 250, 252, 0.92);
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
  background: rgba(239, 246, 255, 0.96);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.12);
}

.community-mine__reply-title {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.community-mine__reply-content {
  margin-top: 8px;
  color: #334155;
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
  color: #0f172a;
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
