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
          :color="$q.dark.isActive ? 'blue-grey-10' : 'white'"
          :text-color="$q.dark.isActive ? 'grey-4' : 'primary'"
          class="feed__toggle"
          :model-value="order"
          :options="orderOptions"
          @update:model-value="$emit('update:order', $event)"
        />

        <q-btn-toggle
          flat
          no-caps
          toggle-color="primary"
          :color="$q.dark.isActive ? 'blue-grey-10' : 'white'"
          :text-color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
          class="feed__toggle feed__toggle--scope"
          :model-value="scope"
          :options="scopeOptions"
          @update:model-value="$emit('update:scope', $event)"
        />
      </div>
    </div>

    <div v-if="subCategories.length" class="feed__subcategories">
      <div class="feed__subcategories-label">子分类</div>
      <div class="feed__subcategories-list">
        <button
          type="button"
          class="feed__subcategories-item"
          :class="{ 'feed__subcategories-item--active': !selectedSubCategoryKey }"
          @click="$emit('update:sub-category', '')"
        >
          <span class="feed__subcategories-name">全部</span>
          <span class="feed__subcategories-count">{{ subCategories.reduce((sum, item) => sum + item.Count, 0) }}</span>
        </button>

        <button
          v-for="subCategory in subCategories"
          :key="subCategory.Key"
          type="button"
          class="feed__subcategories-item"
          :class="{ 'feed__subcategories-item--active': selectedSubCategoryKey === subCategory.Key }"
          @click="$emit('update:sub-category', subCategory.Key)"
        >
          <span class="feed__subcategories-name">{{ subCategory.Label }}</span>
          <span class="feed__subcategories-count">{{ subCategory.Count }}</span>
        </button>
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
      <div v-if="error" class="feed__inline-error">
        <q-icon name="mdiAlertCircleOutline" size="18px" color="negative" />
        <span class="feed__state-text">{{ error }}</span>
        <q-btn flat no-caps color="primary" label="重试加载更多" @click="$emit('retry')" />
      </div>

      <community-thread-card v-for="item in items" :key="item.Id" :item="item" />
    </div>

    <div v-else-if="error" class="feed__state">
      <q-icon name="mdiAlertCircleOutline" size="38px" color="negative" />
      <div class="feed__state-title">帖子流加载失败</div>
      <div class="feed__state-text">{{ error }}</div>
      <q-btn unelevated no-caps color="primary" label="重新加载" @click="$emit('retry')" />
    </div>

    <div v-else class="feed__state">
      <q-icon name="mdiForumOutline" size="38px" color="primary" />
      <div class="feed__state-title">当前筛选下还没有帖子</div>
      <div class="feed__state-text">可以切换板块或排序，或者直接发起一个新的讨论。</div>
    </div>

    <div v-if="items.length" class="feed__footer">
      <div class="feed__page">
        第 {{ pagination.Page }} / {{ pagination.TotalPages }} 页，共 {{ pagination.Total }} 条
      </div>
      <q-btn
        v-if="pagination.HasMore"
        unelevated
        no-caps
        color="primary"
        :loading="loadingMore"
        label="加载更多"
        @click="$emit('load-more')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

import type {
  CommunityFeedItem,
  CommunityFeedOrder,
  CommunityFeedScope,
  CommunityPagination,
  CommunitySubCategorySummary,
} from 'src/services/forum'

import CommunityThreadCard from './CommunityThreadCard.vue'

const $q = useQuasar()

defineProps<{
  items: CommunityFeedItem[]
  loading: boolean
  loadingMore: boolean
  error: string
  order: CommunityFeedOrder
  scope: CommunityFeedScope
  subCategories: CommunitySubCategorySummary[]
  selectedSubCategoryKey: string
  pagination: CommunityPagination
}>()

defineEmits<{
  'update:order': [order: CommunityFeedOrder]
  'update:scope': [scope: CommunityFeedScope]
  'update:sub-category': [subCategoryKey: string]
  'load-more': []
  retry: []
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

.feed__subcategories {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 2px 2px;
  flex-wrap: wrap;
}

.feed__subcategories-label {
  color: var(--community-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feed__subcategories-list {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.feed__subcategories-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--community-border);
  border-radius: 999px;
  background: var(--community-card-bg-soft);
  color: var(--community-text-soft);
  font-size: 13px;
  font-weight: 600;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.feed__subcategories-item:hover {
  transform: translateY(-1px);
  border-color: var(--community-border-strong);
}

.feed__subcategories-item--active {
  border-color: var(--community-border-strong);
  color: var(--community-accent);
  background: var(--community-chip-bg-strong);
}

.feed__subcategories-count {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--community-chip-bg);
  color: inherit;
  font-size: 12px;
  line-height: 1;
}

.feed__toggle {
  border-radius: 14px;
  background: var(--community-card-bg-soft);
  box-shadow: inset 0 0 0 1px var(--community-border);
}

.feed__toggle--scope {
  box-shadow: inset 0 0 0 1px var(--community-border);
}

.feed__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feed-item {
  padding: 22px 22px 18px;
  border: 1px solid var(--community-border);
  border-radius: 24px;
  background: var(--community-card-bg);
  box-shadow: var(--community-shadow);
}

.feed-item--loading {
  min-height: 178px;
}

.feed__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 52px 24px;
  border: 1px dashed var(--community-border-strong);
  border-radius: 24px;
  background: var(--community-empty-bg);
  text-align: center;
}

.feed__inline-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(248, 113, 113, 0.22);
  border-radius: 16px;
  background: color-mix(in srgb, var(--community-card-bg-soft) 78%, #7f1d1d 22%);
  flex-wrap: wrap;
}

.feed__state-title {
  color: var(--community-text);
  font-size: 18px;
  font-weight: 700;
}

.feed__state-text,
.feed__page {
  color: var(--community-text-soft);
  font-size: 13px;
}

.feed__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .feed__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
