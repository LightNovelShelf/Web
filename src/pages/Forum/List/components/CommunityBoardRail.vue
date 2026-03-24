<template>
  <aside class="board-rail" :style="{ top: `${stickyTop}px` }">
    <div class="board-rail__header">
      <div class="board-rail__eyebrow">Community</div>
      <h2 class="board-rail__title">社区</h2>
      <p class="board-rail__summary">按板块快速切换讨论主题，先看内容，再决定要不要参与。</p>
    </div>

    <button
      v-for="board in boards"
      :key="board.key"
      class="board-rail__item"
      :class="{ 'board-rail__item--active': board.key === selectedBoardKey }"
      type="button"
      @click="$emit('select', board.key)"
    >
      <span class="board-rail__icon">
        <q-icon :name="board.icon" size="19px" />
      </span>
      <span class="board-rail__content">
        <span class="board-rail__name">{{ board.title }}</span>
        <span class="board-rail__description">{{ board.description }}</span>
      </span>
      <span class="board-rail__meta">
        <span class="board-rail__count">{{ board.todayPosts }}</span>
        <span class="board-rail__heat">{{ board.heatLabel }}</span>
      </span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { CommunityBoardKey, CommunityBoardSummary } from 'src/services/forum/types'

defineProps<{
  boards: CommunityBoardSummary[]
  selectedBoardKey: CommunityBoardKey
  stickyTop: number
}>()

defineEmits<{
  select: [key: CommunityBoardKey]
}>()
</script>

<style scoped lang="scss">
.board-rail {
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.board-rail__header {
  padding: 4px 2px 10px;
}

.board-rail__eyebrow {
  color: var(--community-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.board-rail__title {
  margin: 6px 0;
  font-size: 28px;
  line-height: 1.1;
}

.board-rail__summary {
  margin: 0;
  color: var(--community-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

.board-rail__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  width: 100%;
  padding: 16px 16px 15px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  text-align: left;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.board-rail__item:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.22);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.board-rail__item--active {
  border-color: rgba(59, 130, 246, 0.35);
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.92), rgba(255, 255, 255, 0.96)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 36px rgba(59, 130, 246, 0.12);
}

.board-rail__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--community-accent);
}

.board-rail__content,
.board-rail__meta {
  display: flex;
  flex-direction: column;
}

.board-rail__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--community-text);
}

.board-rail__description {
  margin-top: 4px;
  color: var(--community-text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.board-rail__meta {
  align-items: flex-end;
  justify-content: space-between;
  min-width: 64px;
}

.board-rail__count {
  color: var(--community-accent);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.board-rail__heat {
  color: var(--community-text-muted);
  font-size: 11px;
  white-space: nowrap;
}
</style>
