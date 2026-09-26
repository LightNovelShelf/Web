import { useQuasar } from 'quasar'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSettingStore } from '@/stores/setting'

import { NOOP } from '@/const/empty'

import { useLoadingFn } from '../useFnLoading'
import { useInitRequest } from './useInitRequest'
import { numberQuery, useQueryState } from './useQueryState'

import type { InitRequestContext } from './useInitRequest'
import type { QInfiniteScroll } from 'quasar'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'

export interface PagedListPage<T> {
  data: T[]
  totalPages: number
}

export interface PagedListOptions<T> {
  /** 取一页数据 */
  fetch(page: number): Promise<PagedListPage<T>>
  /** 影响结果集的筛选项，页内向前切换时回到第一页，后退时保留历史页码 */
  deps?: () => unknown
}

export interface PagedList<T> {
  items: Ref<T[]>
  totalPage: Ref<number>
  /** 分页模式下即 url 上的 page，关掉分页后是已加载到的页 */
  currentPage: WritableComputedRef<number>
  loading: ComputedRef<boolean>
  /** 最近一次加载的错误，成功后清空 */
  error: Ref<unknown>
  /** 分页模式：关闭时滚动到底自动加载下一页 */
  paging: ComputedRef<boolean>
  scrollRef: Ref<QInfiniteScroll | undefined>
  onLoad(index: number, done: (stop?: boolean) => void): Promise<void>
  /** 立刻重新加载当前页 */
  reload(): void
}

/**
 * 列表分页
 *
 * @description
 * 分页模式（设置项 generalSetting.paging）下页码走 url query，刷新与前进后退都能恢复；
 * 关掉分页后滚动到底自动追加，页码只在内存里，url 上不留 page。
 * 覆盖式加载交给 useInitRequest，前进刷新，后退仅在页码或筛选项与缓存不匹配时刷新。
 */
export function usePagedList<T>(options: PagedListOptions<T>): PagedList<T> {
  const $q = useQuasar()
  const route = useRoute()
  const router = useRouter()
  const routeName = route.name
  const { generalSetting } = useSettingStore()

  const items = ref([]) as Ref<T[]>
  const totalPage = ref(1)
  const loadedPage = ref(0)
  const scrollRef = ref<QInfiniteScroll>()
  const paging = computed(() => generalSetting.paging)

  const pageQuery = useQueryState('page', numberQuery(1))
  const scrollPage = ref(1)
  const currentPage = computed({
    get: () => (paging.value ? pageQuery.value : scrollPage.value),
    set: (value: number) => {
      if (paging.value) pageQuery.value = value
      else scrollPage.value = value
    },
  })

  const depsKey = computed(() => JSON.stringify(options.deps?.() ?? null))

  async function fetchPage(page: number, append: boolean) {
    const result = await options.fetch(page)
    items.value = append ? items.value.concat(result.data) : result.data
    totalPage.value = result.totalPages || 1
    loadedPage.value = page
    scrollPage.value = page
    // 覆盖式加载后允许滚动继续触发（上一轮可能已经 stop）
    if (!append) scrollRef.value?.resume()
  }

  const init = useInitRequest(
    async ({ params, reason }: InitRequestContext<{ page: number; deps: string }>) => {
      // 非分页模式不认 url 上的页码，顺手把它抹掉
      if (!paging.value && route.query.page !== undefined) {
        const query = { ...route.query }
        delete query.page
        void router.replace({ query })
      }

      loadedPage.value = 0
      await fetchPage(params.page, false)

      // 页内换页或换筛选项时列表整体变了，回到顶部；后退恢复的滚动位置不能动
      if (reason === 'params') window.scrollTo({ top: 0 })
    },
    () => ({ page: paging.value ? pageQuery.value : 1, deps: depsKey.value }),
  )

  const append = useLoadingFn((page: number) => fetchPage(page, true))
  const loading = computed(() => init.loading.value || append.loading.value)

  // 缓存页仍会收到其他路由的 query 变化，只处理本页的筛选条件。
  let activeDepsKey = depsKey.value
  watch(
    () => ({ name: route.name, deps: depsKey.value }),
    (next, previous) => {
      if (next.name !== routeName || next.deps === activeDepsKey) return
      activeDepsKey = next.deps
      items.value = []
      totalPage.value = 1
      // 返回缓存页时保留目标历史记录中的页码。
      if (previous.name === routeName && route.meta.reload) currentPage.value = 1
    },
  )

  async function onLoad(index: number, done: (stop?: boolean) => void) {
    if (loading.value) return done()

    const next = loadedPage.value + 1
    if (next > totalPage.value) return done(true)

    await append(next).catch(NOOP)
    done(loadedPage.value >= totalPage.value)
  }

  watch(loading, (nextLoading) => {
    $q.loadingBar.stop()
    if (nextLoading) $q.loadingBar.start()
  })

  return {
    items,
    totalPage,
    currentPage,
    loading,
    error: init.error,
    paging,
    scrollRef,
    onLoad,
    reload: init.reload,
  }
}
