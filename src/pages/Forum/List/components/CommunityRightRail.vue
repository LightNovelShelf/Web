<template>
  <aside class="right-rail">
    <overlay-scrollbars-component class="right-rail__scroll" :options="scrollbarOptions" defer>
      <div class="right-rail__content-wrap">
        <section class="rail-panel">
          <div class="rail-panel__header">
            <div>
              <h3 class="rail-panel__title">热帖榜</h3>
            </div>
            <q-icon name="mdiFire" size="22px" color="negative" />
          </div>

          <div class="rank-list">
            <router-link
              v-for="(item, index) in hotThreads"
              :key="item.Id"
              class="rank-item-link"
              :to="{ name: 'ForumThread', params: { id: item.Id } }"
            >
              <div class="rank-item">
                <div class="rank-item__index" :class="{ 'rank-item__index--hot': index < 3 }">{{ index + 1 }}</div>
                <div class="rank-item__copy">
                  <div class="rank-item__title">{{ item.Title }}</div>
                  <div class="rank-item__meta">{{ item.BoardName }} · {{ formatPublishedAt(item.PublishedAt) }}</div>
                </div>
                <div class="rank-item__value">{{ item.Heat }}</div>
              </div>
            </router-link>
          </div>
        </section>

        <section class="rail-panel">
          <div class="rail-panel__header">
            <div>
              <h3 class="rail-panel__title">活跃榜</h3>
            </div>
            <q-icon name="mdiAccountMultiple" size="20px" color="primary" />
          </div>

          <div class="user-list">
            <div v-for="user in activeUsers" :key="user.Id" class="user-item">
              <q-avatar size="42px" :style="user.Avatar ? undefined : { background: avatarBackground(user.Name), color: '#fff' }">
                <img v-if="user.Avatar" class="community-avatar__image" :src="user.Avatar" :alt="user.Name" />
                <template v-else>{{ user.Name.slice(0, 1) }}</template>
              </q-avatar>
              <div class="user-item__copy">
                <div class="user-item__name-row">
                  <span class="user-item__name">{{ user.Name }}</span>
                  <span class="user-item__badge">{{ user.Badge }}</span>
                </div>
                <div class="user-item__summary">{{ user.Summary }}</div>
              </div>
              <div class="user-item__score">{{ user.Score }}</div>
            </div>
          </div>
        </section>
      </div>
    </overlay-scrollbars-component>
  </aside>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'

import { parseTime, toNow } from 'src/utils/time'

import type { CommunityActiveUserItem, CommunityHotRankItem } from 'src/services/forum'

const props = defineProps<{
  hotThreads: CommunityHotRankItem[]
  activeUsers: CommunityActiveUserItem[]
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

const avatarPalette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#ea580c', '#0891b2']

function avatarBackground(seed: string) {
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length
  return `linear-gradient(135deg, ${avatarPalette[index]}, #93c5fd)`
}

function formatPublishedAt(value: string) {
  return toNow(parseTime(value))
}
</script>

<style scoped lang="scss">
.right-rail {
  min-width: 0;
}

.right-rail__scroll {
  width: 100%;
  max-height: calc(100vh - var(--community-sticky-top) - 24px);
  padding-right: 12px;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.right-rail__content-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

.rail-panel {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid var(--community-border);
  border-radius: 24px;
  background: var(--community-card-bg);
  box-shadow: var(--community-side-shadow);
}

.rail-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.rail-panel__title {
  margin: 0;
  font-size: 22px;
}

.rank-list,
.user-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rank-item-link {
  display: block;
  color: inherit;
  text-decoration: none;
  border-radius: 16px;
}

.rank-item,
.user-item {
  display: grid;
  align-items: center;
}

.rank-item {
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.rank-item-link:hover .rank-item,
.rank-item-link:focus-visible .rank-item {
  transform: translateY(-1px);
  background: var(--community-hover-bg);
  box-shadow: inset 0 0 0 1px var(--community-border-strong);
}

.rank-item__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: var(--community-chip-bg);
  color: var(--community-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.rank-item__index--hot {
  background: rgba(248, 113, 113, 0.14);
  color: #dc2626;
}

.rank-item__copy {
  min-width: 0;
}

.rank-item__title {
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rank-item__meta {
  color: var(--community-text-muted);
  font-size: 11px;
  margin-top: 2px;
}

.rank-item__value {
  color: var(--community-accent);
  font-size: 13px;
  font-weight: 700;
}

.user-item {
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 10px 0;
}

.user-item + .user-item {
  border-top: 1px solid var(--community-border);
}

.community-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-item__copy {
  min-width: 0;
}

.user-item__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-item__name {
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
}

.user-item__badge {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--community-chip-bg);
  color: var(--community-accent);
  font-size: 11px;
}

.user-item__summary {
  color: var(--community-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.user-item__score {
  color: var(--community-accent);
  font-size: 14px;
  font-weight: 700;
}
</style>
