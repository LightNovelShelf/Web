<template>
  <q-page :class="['community-home', { 'community-home--dark': $q.dark.isActive }]">
    <div class="community-home__shell">
      <div class="community-home__grid">
        <div class="community-home__left">
          <community-board-rail :boards="boards" :selected-board-key="boardKey" @select="handleBoardSelect" />
        </div>

        <main class="community-home__center">
          <section class="community-hero">
            <community-blueprint-canvas />

            <div class="community-hero__content">
              <div class="community-hero__copy">
                <h1 class="community-hero__title">{{ payload?.Title ?? '社区讨论中心' }}</h1>
                <p class="community-hero__subtitle">{{ payload?.Subtitle }}</p>
              </div>

              <div class="community-hero__stats">
                <div class="community-hero__stat">
                  <span class="community-hero__stat-label">今日新增</span>
                  <strong>{{ payload?.TodayThreads ?? 0 }}</strong>
                </div>
                <div class="community-hero__stat">
                  <span class="community-hero__stat-label">在线用户</span>
                  <strong>{{ payload?.OnlineUserCount ?? 0 }}</strong>
                </div>
              </div>
            </div>
          </section>

          <section class="community-notice">
            <div class="community-notice__label">
              <q-icon name="mdiBullhorn" size="18px" />
              公告
            </div>
            <div class="community-notice__text">{{ payload?.Announcement }}</div>
            <q-btn flat no-caps color="primary" label="查看板块" :to="payload?.AnnouncementLink" />
          </section>

          <community-composer
            :user="user"
            :ready="initialRequestCompleted"
            :catalog-boards="payload?.CatalogBoards ?? []"
            :selected-board-key="boardKey"
            :selected-sub-category-key="payload?.SelectedSubCategoryKey ?? ''"
            :submitting="creatingThread"
            @create="handleThreadCreate"
          />

          <community-feed-list
            :items="feedItems"
            :loading="loading"
            :loading-more="loadingMore"
            :error="error"
            :order="order"
            :scope="scope"
            :sub-categories="payload?.SubCategories ?? []"
            :selected-sub-category-key="payload?.SelectedSubCategoryKey ?? ''"
            :pagination="pagination"
            @update:order="handleOrderChange"
            @update:scope="handleScopeChange"
            @update:sub-category="handleSubCategoryChange"
            @load-more="handleLoadMore"
            @retry="handleRetry"
          />
        </main>

        <div class="community-home__right">
          <community-right-rail :hot-threads="payload?.HotThreads ?? []" :active-users="payload?.ActiveUsers ?? []" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'

import { useAppStore } from 'stores/app'

import { useInitRequest } from 'src/composition/biz/useInitRequest'

import { createCommunityThread, getCommunityFeed, getCommunityHome } from 'src/services/forum'

import type {
  CommunityBoardKey,
  CommunityFeedItem,
  CommunityFeedOrder,
  CommunityFeedScope,
  CommunityHomePayload,
  CommunityPagination,
  CreateCommunityThreadRequest,
} from 'src/services/forum'

import CommunityBlueprintCanvas from './components/CommunityBlueprintCanvas.vue'
import CommunityBoardRail from './components/CommunityBoardRail.vue'
import CommunityComposer from './components/CommunityComposer.vue'
import CommunityFeedList from './components/CommunityFeedList.vue'
import CommunityRightRail from './components/CommunityRightRail.vue'

const appStore = useAppStore()
const { user } = storeToRefs(appStore)
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const payload = ref<CommunityHomePayload>()
const feedItems = ref<CommunityFeedItem[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const creatingThread = ref(false)
const error = ref('')
const currentPage = ref(1)
const latestRequestId = ref(0)
const initialRequestCompleted = ref(false)

const emptyPagination: CommunityPagination = {
  Page: 1,
  Size: 6,
  Total: 0,
  TotalPages: 1,
  HasMore: false,
}

const boardKey = computed<CommunityBoardKey>(() => {
  const value = route.query.board
  if (typeof value !== 'string') return 'all'
  const normalized = value.trim()
  return normalized || 'all'
})

const subCategoryKey = computed(() => {
  const value = route.query.category
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  return normalized === 'all' ? '' : normalized
})

const order = computed<CommunityFeedOrder>(() => {
  const value = route.query.order
  if (typeof value !== 'string') return 'latest'
  return ['latest', 'hot', 'featured'].includes(value) ? (value as CommunityFeedOrder) : 'latest'
})

const scope = computed<CommunityFeedScope>(() => {
  const value = route.query.scope
  if (typeof value !== 'string') return 'all'
  return ['all', 'today', 'week'].includes(value) ? (value as CommunityFeedScope) : 'all'
})

const boards = computed(() => payload.value?.Boards ?? [])
const pagination = computed(() => payload.value?.FeedPage ?? emptyPagination)
const routeQueryKey = computed(() => [boardKey.value, order.value, scope.value, subCategoryKey.value].join(':'))

async function loadCommunityHome(options: { append?: boolean } = {}) {
  const append = options.append ?? false
  const page = append ? currentPage.value + 1 : 1
  const requestId = ++latestRequestId.value

  error.value = ''
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    currentPage.value = 1
  }

  try {
    const nextPayload = await getCommunityHome({
      boardKey: boardKey.value,
      subCategoryKey: subCategoryKey.value || undefined,
      order: order.value,
      scope: scope.value,
      page,
      size: 6,
    })

    if (requestId !== latestRequestId.value) {
      return
    }

    payload.value = nextPayload
    currentPage.value = page
    feedItems.value = append ? [...feedItems.value, ...nextPayload.Feed] : nextPayload.Feed
  } catch (err) {
    if (requestId !== latestRequestId.value) {
      return
    }

    error.value = err instanceof Error ? err.message : '请稍后再试'
    if (!append) {
      feedItems.value = []
    }
  } finally {
    if (requestId === latestRequestId.value) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

async function loadCommunityFeed(options: { append?: boolean } = {}) {
  const append = options.append ?? false
  const page = append ? currentPage.value + 1 : 1
  const requestId = ++latestRequestId.value

  error.value = ''
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    currentPage.value = 1
  }

  try {
    const nextPayload = await getCommunityFeed({
      boardKey: boardKey.value,
      subCategoryKey: subCategoryKey.value || undefined,
      order: order.value,
      scope: scope.value,
      page,
      size: 6,
    })

    if (requestId !== latestRequestId.value) {
      return
    }

    if (!payload.value) {
      payload.value = {
        Title: '社区讨论中心',
        Subtitle: '',
        Announcement: '',
        AnnouncementLink: '',
        TodayThreads: 0,
        OnlineUserCount: 0,
        CatalogBoards: [],
        Boards: [],
        SubCategories: nextPayload.SubCategories,
        SelectedSubCategoryKey: nextPayload.SelectedSubCategoryKey,
        Feed: nextPayload.Feed,
        FeedPage: nextPayload.FeedPage,
        HotThreads: [],
        ActiveUsers: [],
      }
    } else {
      payload.value = {
        ...payload.value,
        SubCategories: nextPayload.SubCategories,
        SelectedSubCategoryKey: nextPayload.SelectedSubCategoryKey,
        Feed: nextPayload.Feed,
        FeedPage: nextPayload.FeedPage,
      }
    }

    currentPage.value = page
    feedItems.value = append ? [...feedItems.value, ...nextPayload.Feed] : nextPayload.Feed
  } catch (err) {
    if (requestId !== latestRequestId.value) {
      return
    }

    error.value = err instanceof Error ? err.message : '请稍后再试'
    if (!append) {
      feedItems.value = []
      if (payload.value) {
        payload.value = {
          ...payload.value,
          Feed: [],
          FeedPage: emptyPagination,
        }
      }
    }
  } finally {
    if (requestId === latestRequestId.value) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

async function requestCommunityHomeOnEnter() {
  await loadCommunityHome()
  initialRequestCompleted.value = true
}

function requestCommunityFeedForQueryChange() {
  void loadCommunityFeed()
}

function updateQuery(next: Partial<Record<'board' | 'order' | 'scope' | 'category', string | undefined>>) {
  const query = { ...route.query }

  for (const [key, value] of Object.entries(next)) {
    if (
      !value ||
      (key === 'board' && value === 'all') ||
      (key === 'order' && value === 'latest') ||
      (key === 'scope' && value === 'all')
    ) {
      delete query[key]
    } else {
      query[key] = value
    }
  }

  void router.replace({ name: 'ForumList', query })
}

function handleBoardSelect(key: CommunityBoardKey) {
  updateQuery({ board: key, category: undefined })
}

function handleOrderChange(nextOrder: CommunityFeedOrder) {
  updateQuery({ order: nextOrder })
}

function handleScopeChange(nextScope: CommunityFeedScope) {
  updateQuery({ scope: nextScope })
}

function handleSubCategoryChange(nextSubCategoryKey: string) {
  updateQuery({ category: nextSubCategoryKey || undefined })
}

function handleLoadMore() {
  if (!pagination.value.HasMore || loadingMore.value) {
    return
  }

  if (!payload.value) {
    void loadCommunityHome({ append: true })
    return
  }

  void loadCommunityFeed({ append: true })
}

function handleRetry() {
  if (!payload.value) {
    void loadCommunityHome()
    return
  }

  void loadCommunityFeed()
}

async function handleThreadCreate(payloadDraft: Omit<CreateCommunityThreadRequest, 'authorName'>) {
  if (!user.value) {
    $q.notify({
      type: 'warning',
      message: '请先登录后再发帖',
    })
    void router.push({ name: 'Login', query: { from: encodeURIComponent(route.fullPath) } })
    return
  }

  creatingThread.value = true

  try {
    const created = await createCommunityThread(payloadDraft)

    $q.notify({
      type: 'positive',
      message: '帖子已发布',
    })

    await loadCommunityHome()
    await router.push({ name: 'ForumThread', params: { id: created.Id } })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : '发布失败',
    })
  } finally {
    creatingThread.value = false
  }
}

useInitRequest(requestCommunityHomeOnEnter)

watch(routeQueryKey, () => {
  requestCommunityFeedForQueryChange()
})
</script>

<style scoped lang="scss">
.community-home {
  --community-accent: #2563eb;
  --community-text: #0f172a;
  --community-text-soft: #475569;
  --community-text-muted: #94a3b8;
  --community-card-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95)), rgba(255, 255, 255, 0.96);
  --community-card-bg-soft: rgba(255, 255, 255, 0.82);
  --community-card-bg-strong: linear-gradient(135deg, rgba(239, 246, 255, 0.92), rgba(255, 255, 255, 0.98)), rgba(255, 255, 255, 0.96);
  --community-empty-bg: rgba(255, 255, 255, 0.82);
  --community-chip-bg: rgba(226, 232, 240, 0.72);
  --community-chip-bg-strong: rgba(239, 246, 255, 0.92);
  --community-border: rgba(148, 163, 184, 0.18);
  --community-border-strong: rgba(59, 130, 246, 0.3);
  --community-hover-bg: rgba(239, 246, 255, 0.96);
  --community-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
  --community-side-shadow: 2px 2px 4px rgba(15, 23, 42, 0.08);
  --community-sticky-top: 84px;
  min-height: 100%;
  padding: 26px 22px 0;
  background:
    radial-gradient(circle at top left, rgba(147, 197, 253, 0.16), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #f8fafc 100%);
}

.community-home--dark {
  --community-accent: #60a5fa;
  --community-text: #e2e8f0;
  --community-text-soft: #94a3b8;
  --community-text-muted: #64748b;
  --community-card-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.9)), rgba(15, 23, 42, 0.92);
  --community-card-bg-soft: rgba(15, 23, 42, 0.84);
  --community-card-bg-strong: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.94)), rgba(15, 23, 42, 0.96);
  --community-empty-bg: rgba(17, 24, 39, 0.96);
  --community-chip-bg: rgba(51, 65, 85, 0.76);
  --community-chip-bg-strong: rgba(30, 41, 59, 0.92);
  --community-border: rgba(148, 163, 184, 0.16);
  --community-border-strong: rgba(96, 165, 250, 0.34);
  --community-hover-bg: rgba(30, 41, 59, 0.94);
  --community-shadow: 0 24px 60px rgba(2, 6, 23, 0.38);
  --community-side-shadow: 2px 2px 6px rgba(2, 6, 23, 0.22);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.2), transparent 24%),
    linear-gradient(180deg, #020617 0%, #0f172a 48%, #111827 100%);
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

.community-home__left,
.community-home__right {
  position: sticky;
  top: var(--community-sticky-top);
  align-self: start;
}

.community-home__center {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 40px;
}

.community-hero {
  position: relative;
  overflow: hidden;
  padding: 24px 28px 18px;
  border: 1px solid var(--community-border);
  border-radius: 30px;
  background: var(--community-card-bg-strong);
  box-shadow: var(--community-shadow);
}

.community-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.community-hero__title {
  margin: 0;
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
  border: 1px solid var(--community-border);
  border-radius: 18px;
  background: var(--community-card-bg-soft);
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
  border: 1px solid var(--community-border);
  border-radius: 18px;
  background: var(--community-card-bg-soft);
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
