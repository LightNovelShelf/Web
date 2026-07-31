<template>
  <aside class="board-rail" :class="{ 'board-rail--compact': compact }">
    <overlay-scrollbars-component class="board-rail__scroll" :options="scrollbarOptions" defer>
      <div class="board-rail__content-wrap">
        <div class="board-rail__header">
          <h2 class="board-rail__title">社区</h2>
        </div>

        <overlay-scrollbars-component class="board-rail__items-scroll" :options="horizontalScrollbarOptions" defer>
          <div class="board-rail__items">
            <button
              v-for="board in boards"
              :key="board.Key"
              class="board-rail__item"
              :class="{ 'board-rail__item--active': board.Key === selectedBoardKey }"
              type="button"
              :aria-pressed="board.Key === selectedBoardKey"
              @click="$emit('select', board.Key)"
            >
              <span class="board-rail__icon">
                <q-icon :name="board.Icon" size="19px" />
              </span>
              <span class="board-rail__content">
                <span class="board-rail__name">{{ board.Title }}</span>
                <span class="board-rail__description">{{ board.Description }}</span>
              </span>
              <span class="board-rail__meta">
                <span class="board-rail__count">{{ board.TodayPosts }}</span>
                <span class="board-rail__heat">{{ board.HeatLabel }}</span>
              </span>
            </button>
          </div>
        </overlay-scrollbars-component>
      </div>
    </overlay-scrollbars-component>
  </aside>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'

import type { CommunityBoardKey, CommunityBoardSummary } from 'src/services/forum'

const props = defineProps<{
  boards: CommunityBoardSummary[]
  selectedBoardKey: CommunityBoardKey
  compact?: boolean
}>()

defineEmits<{
  select: [key: CommunityBoardKey]
}>()

const $q = useQuasar()

const scrollbarOptions = computed(() => ({
  scrollbars: {
    theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
    autoHide: 'move' as const,
    autoHideDelay: 300,
    autoHideSuspend: false,
  },
}))

const horizontalScrollbarOptions = computed(() => ({
  overflow: {
    x: 'scroll' as const,
    y: 'hidden' as const,
  },
  scrollbars: {
    theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
    autoHide: 'move' as const,
    autoHideDelay: 300,
    autoHideSuspend: false,
  },
}))
</script>

<style scoped lang="scss">
.board-rail {
  min-width: 0;
}

.board-rail__scroll {
  width: 100%;
  max-height: calc(100vh - var(--community-sticky-top) - 24px);
  padding-right: 12px;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.board-rail__items-scroll {
  min-width: 0;
  width: 100%;
}

.board-rail__content-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

.board-rail__items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.board-rail__header {
  padding: 4px 2px 10px;
}

.board-rail__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.board-rail__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 8px 10px;
  width: 100%;
  padding: 14px;
  border: 1px solid var(--community-border);
  border-radius: 20px;
  background: var(--community-card-bg-soft);
  text-align: left;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.board-rail__item:hover {
  transform: translateY(-1px);
  border-color: var(--community-border-strong);
  box-shadow: var(--community-side-shadow);
}

.board-rail__item--active {
  border-color: var(--community-border-strong);
  background: var(--community-card-bg-strong);
  box-shadow: var(--community-side-shadow);
}

.board-rail__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: var(--community-chip-bg);
  color: var(--community-accent);
}
.board-rail__icon {
  grid-column: 1;
  grid-row: 1;
}
.board-rail__content,
.board-rail__meta {
  display: contents;
}

.board-rail__name {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
  min-width: 0;
  color: var(--community-text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.board-rail__description {
  grid-column: 1 / 3;
  grid-row: 2;
  min-width: 0;
  color: var(--community-text-soft);
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.board-rail__count {
  grid-column: 3;
  grid-row: 1;
  align-self: center;
  justify-self: end;
  color: var(--community-accent);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.board-rail__heat {
  grid-column: 3;
  grid-row: 2;
  align-self: center;
  justify-self: end;
  color: var(--community-text-muted);
  font-size: 11px;
  white-space: nowrap;
}

.board-rail--compact .board-rail__scroll {
  max-height: none;
  padding-right: 0;
  padding-bottom: 0;
}

.board-rail--compact .board-rail__content-wrap {
  gap: 10px;
}

.board-rail--compact .board-rail__header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 0 2px;
}

.board-rail--compact .board-rail__title {
  flex: 0 0 auto;
  font-size: 22px;
}

.board-rail--compact .board-rail__items {
  flex-direction: row;
  gap: 10px;
  width: max-content;
  min-width: 100%;
  padding: 2px 2px 10px;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
}

.board-rail--compact .board-rail__item {
  flex: 0 0 220px;
  min-height: 88px;
  padding: 12px;
  scroll-snap-align: start;
}

.board-rail--compact .board-rail__description {
  display: block;
}

@media (max-width: 599px) {
  .board-rail--compact .board-rail__header {
    display: block;
  }

  .board-rail--compact .board-rail__item {
    grid-template-columns: auto minmax(0, 1fr) auto;
    flex-basis: 178px;
    min-height: 70px;
    padding: 10px;
    border-radius: 17px;
  }

  .board-rail--compact .board-rail__icon {
    width: 34px;
    height: 34px;
    border-radius: 11px;
  }

  .board-rail--compact .board-rail__description,
  .board-rail--compact .board-rail__heat {
    display: none;
  }

  .board-rail--compact .board-rail__count {
    font-size: 17px;
  }
}
</style>
