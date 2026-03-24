<template>
  <section class="feed">
    <div class="feed__toolbar">
      <div class="feed__toolbar-copy">
        <h3 class="feed__title">帖子流</h3>
        <p class="feed__subtitle">按你关心的板块和排序快速浏览当前社区讨论。</p>
      </div>

      <div class="feed__filters">
        <q-btn-toggle
          unelevated
          no-caps
          toggle-color="primary"
          color="white"
          text-color="primary"
          class="feed__toggle"
          :model-value="order"
          :options="orderOptions"
          @update:model-value="$emit('update:order', $event)"
        />

        <q-btn-toggle
          flat
          no-caps
          toggle-color="primary"
          color="white"
          text-color="grey-7"
          class="feed__toggle feed__toggle--scope"
          :model-value="scope"
          :options="scopeOptions"
          @update:model-value="$emit('update:scope', $event)"
        />
      </div>
    </div>

    <div v-if="loading" class="feed__list">
      <div v-for="index in 4" :key="index" class="feed-item feed-item--loading">
        <q-skeleton type="text" width="35%" />
        <q-skeleton type="text" width="85%" class="q-mt-sm" />
        <q-skeleton type="text" width="72%" class="q-mt-xs" />
        <div class="row items-center q-gutter-sm q-mt-md">
          <q-skeleton type="QAvatar" size="32px" />
          <q-skeleton type="text" width="22%" />
          <q-skeleton type="text" width="18%" />
        </div>
      </div>
    </div>

    <div v-else-if="items.length" class="feed__list">
      <article v-for="item in items" :key="item.id" class="feed-item">
        <div class="feed-item__topline">
          <span class="feed-item__board">{{ item.boardName }}</span>
          <span v-if="item.pinned" class="feed-item__flag feed-item__flag--pinned">置顶</span>
          <span v-if="item.featured" class="feed-item__flag feed-item__flag--featured">精华</span>
          <span v-if="item.locked" class="feed-item__flag feed-item__flag--locked">已锁定</span>
        </div>

        <h4 class="feed-item__title">{{ item.title }}</h4>
        <p v-if="item.excerpt" class="feed-item__excerpt">{{ item.excerpt }}</p>
        <p v-else class="feed-item__excerpt feed-item__excerpt--empty">这条帖子暂时还没有摘要，用来验证摘要缺失时的排版稳定性。</p>

        <div class="feed-item__footer">
          <div class="feed-item__author">
            <q-avatar size="34px" :style="{ background: avatarBackground(item.authorName), color: '#fff' }">
              {{ item.authorName.slice(0, 1) }}
            </q-avatar>
            <div class="feed-item__author-copy">
              <span class="feed-item__author-name">{{ item.authorName }}</span>
              <span class="feed-item__author-time">{{ item.publishedAt }}</span>
            </div>
          </div>

          <div class="feed-item__stats">
            <span class="feed-item__stat">评论 {{ item.replies }}</span>
            <span class="feed-item__stat">浏览 {{ item.views }}</span>
          </div>
        </div>

        <div class="feed-item__tags">
          <span v-for="tag in item.tags" :key="tag" class="feed-item__tag">{{ tag }}</span>
        </div>
      </article>
    </div>

    <div v-else class="feed__empty">
      <q-icon name="mdiForumOutline" size="38px" color="primary" />
      <div class="feed__empty-title">当前筛选下还没有帖子</div>
      <div class="feed__empty-text">可以切换板块或排序，或者直接发起一个新的讨论。</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityFeedItem, CommunityFeedOrder, CommunityFeedScope } from 'src/services/forum/types'

defineProps<{
  items: CommunityFeedItem[]
  loading: boolean
  order: CommunityFeedOrder
  scope: CommunityFeedScope
}>()

defineEmits<{
  'update:order': [order: CommunityFeedOrder]
  'update:scope': [scope: CommunityFeedScope]
}>()

const orderOptions = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'hot' },
  { label: '精华', value: 'featured' },
]

const scopeOptions = [
  { label: '全部时间', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
]

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}
</script>

<style scoped lang="scss">
.feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feed__toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.feed__title {
  margin: 0;
  font-size: 25px;
  line-height: 1.1;
}

.feed__subtitle {
  margin: 8px 0 0;
  color: var(--community-text-soft);
  font-size: 13px;
}

.feed__filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feed__toggle {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.feed__toggle--scope {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.feed__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feed-item {
  padding: 22px 22px 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

.feed-item--loading {
  min-height: 178px;
}

.feed-item__topline,
.feed-item__footer,
.feed-item__stats,
.feed-item__tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.feed-item__board,
.feed-item__flag,
.feed-item__tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.feed-item__board {
  padding: 6px 11px;
  color: var(--community-accent);
  background: rgba(59, 130, 246, 0.08);
}

.feed-item__flag {
  padding: 5px 10px;
  color: white;
}

.feed-item__flag--pinned {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.feed-item__flag--featured {
  background: linear-gradient(135deg, #f59e0b, #fb7185);
}

.feed-item__flag--locked {
  background: linear-gradient(135deg, #64748b, #475569);
}

.feed-item__title {
  margin: 14px 0 0;
  font-size: 24px;
  line-height: 1.3;
  color: var(--community-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-item__excerpt {
  margin: 12px 0 0;
  color: var(--community-text-soft);
  font-size: 14px;
  line-height: 1.75;
}

.feed-item__excerpt--empty {
  font-style: italic;
  color: var(--community-text-muted);
}

.feed-item__footer {
  justify-content: space-between;
  margin-top: 18px;
}

.feed-item__author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feed-item__author-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-item__author-name {
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
}

.feed-item__author-time {
  color: var(--community-text-muted);
  font-size: 12px;
}

.feed-item__stats {
  color: var(--community-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.feed-item__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.feed-item__tags {
  margin-top: 14px;
}

.feed-item__tag {
  padding: 5px 10px;
  color: #475569;
  background: rgba(226, 232, 240, 0.72);
}

.feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 52px 24px;
  border: 1px dashed rgba(59, 130, 246, 0.28);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
}

.feed__empty-title {
  color: var(--community-text);
  font-size: 18px;
  font-weight: 700;
}

.feed__empty-text {
  color: var(--community-text-soft);
  font-size: 13px;
}

@media (max-width: 1200px) {
  .feed__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .feed-item__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
