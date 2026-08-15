import { useSwipe } from '@vueuse/core'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import type { ComputedRef, Ref } from 'vue'

/** 栏间距，同时也是相邻两屏之间的间隔，翻页步进 = 视口宽度 + 该值 */
const FLIP_GAP = 40
/** 视口最低高度，窗口极矮时不至于算出负数 */
const MIN_HEIGHT = 240
/** 视口底部留白 */
const BOTTOM_GAP = 16
/** 滚轮翻页节流，触摸板一次滑动会连续派发 wheel */
const WHEEL_LOCK = 320

export interface FlipPagerOptions {
  /** 是否处于翻页模式 */
  enabled: Ref<boolean>
  /** 分栏数，大屏双栏 */
  columns: Ref<number>
  /** 裁剪视口，固定高度 + overflow hidden */
  viewportRef: Ref<HTMLElement | undefined>
  /** 分栏容器，正文在其中被分栏切片，通过 translateX 移动 */
  flowRef: Ref<HTMLElement | undefined>
  /** 视口下方的页码/按钮区，计算可用高度时要扣掉 */
  footerRef: Ref<HTMLElement | undefined>
  /** 已在首屏/末屏还继续翻页时触发，用于换章 */
  onOverflow: (delta: 1 | -1) => void
}

export interface FlipPager {
  /** 当前屏下标，从 0 开始 */
  page: Ref<number>
  /** 当前章共有多少屏 */
  pageCount: Ref<number>
  /** 绑定到视口的 CSS 变量，翻页模式外为 undefined */
  style: ComputedRef<Record<string, string> | undefined>
  /** 前进/后退一屏，越界时交给 onOverflow */
  turn: (delta: 1 | -1) => void
  goToLast: () => void
  goToPage: (target: number) => void
  /** 翻到包含该元素的那一屏 */
  goToElement: (element?: Element | null) => void
  /** 重新计算视口高度与总屏数 */
  remeasure: () => Promise<void>
  /** 防抖版 remeasure */
  scheduleRemeasure: () => void
  onWheel: (event: WheelEvent) => void
}

/**
 * 用 CSS 多栏把整章正文切成一屏屏，再靠 translateX 横向翻页。
 * 屏数只能从布局后的 scrollWidth 反算，所以字号、页宽、窗口尺寸、字体加载后都要 remeasure。
 */
export function useFlipPager(options: FlipPagerOptions): FlipPager {
  const page = ref(0)
  const pageCount = ref(1)
  /** 视口高度（px），0 表示还没量过，样式里退回 CSS 默认值 */
  const height = ref(0)
  /** 翻一屏的位移 = 视口宽度 + 栏间距 */
  const step = ref(0)

  const offset = computed(() => page.value * step.value)
  const style = computed(() =>
    options.enabled.value
      ? {
          '--flip-columns': String(options.columns.value),
          '--flip-gap': `${FLIP_GAP}px`,
          ...(height.value > 0 ? { '--flip-height': `${height.value}px` } : {}),
          '--flip-offset': `${offset.value}px`,
        }
      : undefined,
  )

  function goToPage(target: number) {
    page.value = Math.min(Math.max(target, 0), pageCount.value - 1)
  }

  function turn(delta: 1 | -1) {
    const target = page.value + delta
    if (target < 0 || target > pageCount.value - 1) {
      options.onOverflow(delta)
      return
    }
    page.value = target
  }

  function goToLast() {
    page.value = Math.max(0, pageCount.value - 1)
  }

  function goToElement(element?: Element | null) {
    const flow = options.flowRef.value
    if (!element || !flow || step.value === 0) return
    // flow 已被 translateX 位移，加回 offset 换算成未位移时的横向距离
    const left = element.getBoundingClientRect().left - flow.getBoundingClientRect().left + offset.value
    goToPage(Math.floor(left / step.value + 0.01))
  }

  async function remeasure() {
    const viewport = options.viewportRef.value
    const flow = options.flowRef.value
    if (!options.enabled.value || !viewport || !flow) return
    // 翻页模式下整页不该再滚动，量高度前先归零，保证 rect.top 就是稳定的布局位置
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0
    const top = viewport.getBoundingClientRect().top
    const footerHeight = options.footerRef.value?.offsetHeight ?? 0
    height.value = Math.max(MIN_HEIGHT, Math.round(window.innerHeight - top - footerHeight - BOTTOM_GAP))
    // 高度变化会重排分栏，等样式落到 DOM 后再量屏数
    await nextTick()
    // 页脚外边距、q-page 内边距、布局 min-height 无法逐项枚举，按实际溢出量回收一次，保证整页不出滚动条
    const overflow = document.documentElement.scrollHeight - document.documentElement.clientHeight
    if (overflow > 0) {
      height.value = Math.max(MIN_HEIGHT, height.value - overflow)
      await nextTick()
    }
    const width = flow.clientWidth
    if (width === 0) return
    step.value = width + FLIP_GAP
    pageCount.value = Math.max(1, Math.round((flow.scrollWidth + FLIP_GAP) / step.value))
    goToPage(page.value)
  }

  let timer: number | undefined
  function scheduleRemeasure() {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => void remeasure(), 120)
  }

  // 视口宽度变化（侧边栏、阅读页宽度设置）要重排；高度是自己写进去的，忽略以免自激循环
  let lastWidth = 0
  const observer = new ResizeObserver((entries) => {
    const width = Math.round(entries[0]!.contentRect.width)
    if (width === lastWidth) return
    lastWidth = width
    scheduleRemeasure()
  })

  watch(
    [options.enabled, options.viewportRef],
    ([enabled, viewport]) => {
      observer.disconnect()
      if (!enabled || !viewport) {
        height.value = 0
        step.value = 0
        pageCount.value = 1
        page.value = 0
        return
      }
      lastWidth = Math.round(viewport.clientWidth)
      observer.observe(viewport)
      void remeasure()
    },
    { immediate: true, flush: 'post' },
  )

  watch(options.columns, () => void remeasure())

  window.addEventListener('resize', scheduleRemeasure)
  onUnmounted(() => {
    observer.disconnect()
    window.removeEventListener('resize', scheduleRemeasure)
    window.clearTimeout(timer)
  })

  let wheelLock = 0
  function onWheel(event: WheelEvent) {
    if (!options.enabled.value) return
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (Math.abs(delta) < 4) return
    event.preventDefault()
    const now = Date.now()
    if (now < wheelLock) return
    wheelLock = now + WHEEL_LOCK
    turn(delta > 0 ? 1 : -1)
  }

  useSwipe(
    computed(() => (options.enabled.value ? options.viewportRef.value : undefined)),
    {
      threshold: 40,
      onSwipeEnd: (_event, direction) => {
        if (direction === 'left') turn(1)
        else if (direction === 'right') turn(-1)
      },
    },
  )

  return { page, pageCount, style, turn, goToLast, goToPage, goToElement, remeasure, scheduleRemeasure, onWheel }
}
