<template>
  <router-link class="feed-item-link" :to="{ name: 'ForumThread', params: { id: item.id } }">
    <article class="feed-item">
      <div class="feed-item__topline">
        <span class="feed-item__board">{{ item.boardName }}</span>
        <span v-if="item.subCategoryLabel" class="feed-item__sub-category">{{ item.subCategoryLabel }}</span>
        <span v-if="item.pinned" class="feed-item__flag feed-item__flag--pinned">置顶</span>
        <span v-if="item.featured" class="feed-item__flag feed-item__flag--featured">精华</span>
        <span v-if="item.locked" class="feed-item__flag feed-item__flag--locked">已锁定</span>
      </div>

      <h4 class="feed-item__title">{{ item.title }}</h4>
      <p v-if="item.excerpt" class="feed-item__excerpt">{{ item.excerpt }}</p>
      <p v-else class="feed-item__excerpt feed-item__excerpt--empty">这条帖子暂时还没有摘要。</p>

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
          <span class="feed-item__stat">点赞 {{ item.likes }}</span>
        </div>
      </div>

      <div class="feed-item__tags">
        <span v-for="tag in item.tags" :key="tag" class="feed-item__tag">{{ tag }}</span>
      </div>
    </article>
  </router-link>
</template>

<script setup lang="ts">
import type { CommunityFeedItem } from 'src/services/forum'

defineProps<{
  item: CommunityFeedItem
}>()

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}
</script>

<style scoped lang="scss">
.feed-item-link {
  display: block;
  color: inherit;
  text-decoration: none;
  border-radius: 24px;
}

.feed-item {
  padding: 22px 22px 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.feed-item-link:hover .feed-item,
.feed-item-link:focus-visible .feed-item {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 22px 40px rgba(37, 99, 235, 0.12);
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
.feed-item__sub-category,
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

.feed-item__sub-category {
  padding: 6px 11px;
  color: #0f766e;
  background: rgba(20, 184, 166, 0.08);
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

@media (max-width: 1200px) {
  .feed-item__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
