<template>
  <section :class="['community-panel', { 'community-panel--dark': $q.dark.isActive }]">
    <div class="community-panel__header">
      <div>
        <h2 class="community-panel__title">我的社区</h2>
      </div>
      <q-btn flat no-caps color="primary" label="进入社区" :to="{ name: 'ForumList' }" />
    </div>

    <div v-if="!authorName" class="community-panel__state">
      <q-icon name="mdiAccountCircleOutline" size="36px" color="grey-6" />
      <div>登录后才能查看你的社区数据。</div>
    </div>

    <template v-else>
      <q-tabs v-model="tab" no-caps indicator-color="primary" active-color="primary" class="community-panel__tabs">
        <q-tab name="threads" label="我发布的帖子" />
        <q-tab name="replies" label="我参与的回复" />
        <q-tab name="favorites" label="我的收藏" />
      </q-tabs>

      <div v-if="loading" class="community-panel__list">
        <div v-for="index in 2" :key="index" class="community-panel__skeleton">
          <q-skeleton type="text" width="35%" />
          <q-skeleton type="text" width="80%" class="q-mt-sm" />
          <q-skeleton type="text" width="66%" class="q-mt-sm" />
        </div>
      </div>

      <div v-else-if="error" class="community-panel__state">
        <q-icon name="mdiAlertCircleOutline" size="36px" color="negative" />
        <div>{{ error }}</div>
        <q-btn unelevated no-caps color="primary" label="重新加载" @click="loadOverview" />
      </div>

        <q-tab-panels v-else v-model="tab" animated class="community-panel__panels">
          <q-tab-panel name="threads" class="community-panel__panel">
          <div v-if="overview?.PublishedThreads.length" class="community-panel__list">
            <community-thread-card
              v-for="item in overview?.PublishedThreads"
              :key="item.Id"
              :item="item"
            />
          </div>
          <div v-else class="community-panel__state">
            <q-icon name="mdiTextBoxOutline" size="36px" color="grey-6" />
            <div>你还没有发布帖子。</div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="replies" class="community-panel__panel">
          <div v-if="overview?.ParticipatedReplies.length" class="community-replies">
            <router-link
              v-for="reply in overview?.ParticipatedReplies"
              :key="reply.Id"
              class="community-replies__item"
              :to="{ name: 'ForumThread', params: { id: reply.ThreadId } }"
            >
              <div class="community-replies__title">{{ reply.ThreadTitle }}</div>
              <div class="community-replies__meta">{{ reply.BoardName }} · {{ formatPublishedAt(reply.PublishedAt) }}</div>
              <div class="community-replies__content">
                <span v-if="reply.ReplyToName" class="community-replies__reply-to">回复 {{ reply.ReplyToName }}：</span>
                {{ reply.Content }}
              </div>
            </router-link>
          </div>
          <div v-else class="community-panel__state">
            <q-icon name="mdiReplyOutline" size="36px" color="grey-6" />
            <div>你还没有参与回复。</div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="favorites" class="community-panel__panel">
          <div v-if="overview?.FavoriteThreads.length" class="community-panel__list">
            <community-thread-card
              v-for="item in overview?.FavoriteThreads"
              :key="item.Id"
              :item="item"
            />
          </div>
          <div v-else class="community-panel__state">
            <q-icon name="mdiBookmarkOutline" size="36px" color="grey-6" />
            <div>你还没有收藏帖子。</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

import { parseTime, toNow } from 'src/utils/time'

import CommunityThreadCard from 'src/pages/Forum/List/components/CommunityThreadCard.vue'
import { getMyCommunityOverview } from 'src/services/forum'

import type { CommunityMyOverview } from 'src/services/forum'

const props = defineProps<{
  authorName?: string
}>()

const $q = useQuasar()
const tab = ref<'threads' | 'replies' | 'favorites'>('threads')
const overview = ref<CommunityMyOverview | null>(null)
const loading = ref(false)
const error = ref('')

function formatPublishedAt(value: string) {
  return toNow(parseTime(value))
}

async function loadOverview() {
  if (!props.authorName) {
    overview.value = null
    return
  }

  loading.value = true
  error.value = ''

  try {
    overview.value = await getMyCommunityOverview()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.authorName,
  () => {
    void loadOverview()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.community-panel {
  --community-accent: #2563eb;
  --community-text: #0f172a;
  --community-text-soft: #64748b;
  --community-text-muted: #94a3b8;
  --community-card-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  --community-card-bg-soft: rgba(255, 255, 255, 0.92);
  --community-chip-bg: rgba(226, 232, 240, 0.72);
  --community-border: rgba(15, 23, 42, 0.08);
  --community-border-strong: rgba(59, 130, 246, 0.3);
  --community-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
  margin-top: 24px;
  padding: 22px;
  border: 1px solid var(--community-border);
  border-radius: 18px;
  background: var(--community-card-bg);
}

.community-panel--dark {
  --community-accent: #60a5fa;
  --community-text: #e2e8f0;
  --community-text-soft: #94a3b8;
  --community-text-muted: #64748b;
  --community-card-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.88));
  --community-card-bg-soft: rgba(15, 23, 42, 0.82);
  --community-chip-bg: rgba(51, 65, 85, 0.76);
  --community-border: rgba(148, 163, 184, 0.16);
  --community-border-strong: rgba(96, 165, 250, 0.32);
  --community-shadow: 0 24px 60px rgba(2, 6, 23, 0.38);
}

.community-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.community-panel__title {
  margin: 0;
  color: var(--community-text);
  font-size: 28px;
}

.community-panel__tabs {
  margin-top: 18px;
}

.community-panel__panels {
  background: transparent;
}

.community-panel__panel {
  padding: 20px 0 0;
}

.community-panel__list,
.community-replies {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.community-panel__skeleton {
  padding: 20px;
  border: 1px solid var(--community-border);
  border-radius: 18px;
  background: var(--community-card-bg-soft);
}

.community-panel__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 24px;
  color: var(--community-text-soft);
  text-align: center;
}

.community-replies__item {
  display: block;
  padding: 16px 18px;
  border: 1px solid var(--community-border);
  border-radius: 16px;
  background: var(--community-card-bg-soft);
  color: inherit;
  text-decoration: none;
}

.community-replies__title {
  color: var(--community-text);
  font-size: 15px;
  font-weight: 700;
}

.community-replies__meta {
  margin-top: 6px;
  color: var(--community-text-soft);
  font-size: 12px;
}

.community-replies__content {
  margin-top: 10px;
  color: var(--community-text-soft);
  font-size: 13px;
  line-height: 1.8;
}

.community-replies__reply-to {
  color: #2563eb;
}

@media (max-width: 720px) {
  .community-panel__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
