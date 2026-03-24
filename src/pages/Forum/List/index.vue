<template>
  <q-page class="community-home">
    <div class="community-home__shell">
      <div class="community-home__grid">
        <community-board-rail
          class="community-home__left"
          :boards="boards"
          :selected-board-key="boardKey"
          :sticky-top="stickyTop"
          @select="handleBoardSelect"
        />

        <main class="community-home__center">
          <section class="community-hero">
            <community-blueprint-canvas />

            <div class="community-hero__content">
              <div class="community-hero__copy">
                <div class="community-hero__eyebrow">Discussion Hub</div>
                <h1 class="community-hero__title">{{ payload?.title ?? '社区讨论中心' }}</h1>
                <p class="community-hero__subtitle">{{ payload?.subtitle }}</p>
              </div>

              <div class="community-hero__stats">
                <div class="community-hero__stat">
                  <span class="community-hero__stat-label">今日新增</span>
                  <strong>{{ payload?.todayThreads ?? 0 }}</strong>
                </div>
                <div class="community-hero__stat">
                  <span class="community-hero__stat-label">在线用户</span>
                  <strong>{{ payload?.onlineUsers ?? 0 }}</strong>
                </div>
              </div>
            </div>
          </section>

          <section class="community-notice">
            <div class="community-notice__label">
              <q-icon name="mdiBullhorn" size="18px" />
              公告
            </div>
            <div class="community-notice__text">{{ payload?.announcement }}</div>
            <q-btn flat no-caps color="primary" label="查看板块" :to="payload?.announcementLink" />
          </section>

          <community-composer :user="user" />

          <community-feed-list
            :items="feedItems"
            :loading="loading"
            :order="order"
            :scope="scope"
            @update:order="handleOrderChange"
            @update:scope="handleScopeChange"
          />
        </main>

        <community-right-rail
          class="community-home__right"
          :hot-threads="payload?.hotThreads ?? []"
          :active-users="payload?.activeUsers ?? []"
          :sticky-top="stickyTop"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAppStore } from 'stores/app'

import { useLayout } from 'src/components/app/useLayout'

import { getCommunityHomePayload } from 'src/services/forum/communityHome'

import type {
  CommunityBoardKey,
  CommunityFeedOrder,
  CommunityFeedScope,
  CommunityHomePayload,
} from 'src/services/forum/types'

import CommunityBlueprintCanvas from './components/CommunityBlueprintCanvas.vue'
import CommunityBoardRail from './components/CommunityBoardRail.vue'
import CommunityComposer from './components/CommunityComposer.vue'
import CommunityFeedList from './components/CommunityFeedList.vue'
import CommunityRightRail from './components/CommunityRightRail.vue'

const appStore = useAppStore()
const { user } = storeToRefs(appStore)

const boardKey = ref<CommunityBoardKey>('all')
const order = ref<CommunityFeedOrder>('latest')
const scope = ref<CommunityFeedScope>('all')
const payload = ref<CommunityHomePayload>()
const loading = ref(true)

const layout = useLayout()
const stickyTop = computed(() => layout.headerOffset.value + 18)

const boards = computed(() => payload.value?.boards ?? [])
const feedItems = computed(() => payload.value?.feed ?? [])

async function loadCommunityHome() {
  loading.value = true
  payload.value = await getCommunityHomePayload({
    boardKey: boardKey.value,
    order: order.value,
    scope: scope.value,
  })
  loading.value = false
}

function handleBoardSelect(key: CommunityBoardKey) {
  boardKey.value = key
}

function handleOrderChange(nextOrder: CommunityFeedOrder) {
  order.value = nextOrder
}

function handleScopeChange(nextScope: CommunityFeedScope) {
  scope.value = nextScope
}

watch([boardKey, order, scope], () => {
  void loadCommunityHome()
})

onMounted(() => {
  void loadCommunityHome()
})
</script>

<style scoped lang="scss">
.community-home {
  --community-accent: #2563eb;
  --community-text: #0f172a;
  --community-text-soft: #475569;
  --community-text-muted: #94a3b8;
  min-height: 100%;
  padding: 26px 22px 40px;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.16), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #f8fafc 100%);
}

.community-home__shell {
  max-width: 1440px;
  margin: 0 auto;
}

.community-home__grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 320px;
  gap: 22px;
  align-items: start;
}

.community-home__center {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.community-hero {
  position: relative;
  overflow: hidden;
  min-height: 190px;
  padding: 26px 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.92), rgba(255, 255, 255, 0.98)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 48px rgba(15, 23, 42, 0.08);
}

.community-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.community-hero__eyebrow {
  color: var(--community-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.community-hero__title {
  margin: 12px 0 0;
  font-size: 38px;
  line-height: 1.05;
  color: var(--community-text);
}

.community-hero__subtitle {
  max-width: 560px;
  margin: 12px 0 0;
  color: var(--community-text-soft);
  font-size: 15px;
  line-height: 1.7;
}

.community-hero__stats {
  display: flex;
  gap: 12px;
}

.community-hero__stat {
  min-width: 108px;
  padding: 14px 16px;
  border: 1px solid rgba(59, 130, 246, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);
}

.community-hero__stat-label {
  display: block;
  color: var(--community-text-muted);
  font-size: 11px;
  margin-bottom: 6px;
}

.community-hero__stat strong {
  color: var(--community-text);
  font-size: 26px;
  line-height: 1;
}

.community-notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
}

.community-notice__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--community-accent);
  font-size: 13px;
  font-weight: 700;
}

.community-notice__text {
  color: var(--community-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1320px) {
  .community-home__grid {
    grid-template-columns: 240px minmax(0, 1fr) 292px;
  }
}

@media (max-width: 1180px) {
  .community-home__grid {
    grid-template-columns: 1fr;
  }

  .community-home__left,
  .community-home__right {
    position: static;
  }

  .community-hero__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .community-notice {
    grid-template-columns: 1fr;
  }
}
</style>
