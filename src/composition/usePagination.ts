import { debounce } from 'quasar'

import type { Ref } from 'vue'

const COLUMN_GAP = 40

export function usePagination(
  viewportRef: Ref<HTMLElement | undefined>,
  contentRef: Ref<HTMLElement | undefined>,
  enabled: Ref<boolean>,
) {
  const currentPage = ref(0)
  const totalPages = ref(0)
  const columnWidth = ref(0)
  const columnHeight = ref(0)
  const pageWidth = ref(0)

  // 拖拽状态
  const isDragging = ref(false)
  const dragOffset = ref(0)

  const translateX = computed(() => {
    if (!enabled.value || !pageWidth.value) return '0px'
    const base = -currentPage.value * pageWidth.value
    return `${base + dragOffset.value}px`
  })

  /** 应用于外层 viewport 容器的样式 */
  const viewportStyle = computed(() => {
    if (!enabled.value || !columnHeight.value) return undefined
    return {
      overflow: 'hidden',
      height: columnHeight.value + 'px',
      touchAction: 'none',
    }
  })

  /** 应用于内层内容元素的样式 */
  const columnStyle = computed(() => {
    if (!enabled.value || !columnWidth.value || !columnHeight.value) return undefined
    return {
      display: 'block',
      height: columnHeight.value + 'px',
      columnWidth: columnWidth.value + 'px',
      columnGap: COLUMN_GAP + 'px',
      columnFill: 'auto' as const,
      transform: `translateX(${translateX.value})`,
      transition: isDragging.value ? 'none' : 'transform 0.3s ease',
      willChange: 'transform' as const,
      '--page-width': columnWidth.value + 'px',
      '--page-height': columnHeight.value + 'px',
    }
  })

  /** 用 JS 直接测量 viewport 到窗口底部的可用高度 */
  function measureHeight() {
    const viewport = viewportRef.value
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    columnHeight.value = Math.floor(window.innerHeight - rect.top)
  }

  function measurePages() {
    const el = contentRef.value
    if (!el || !enabled.value || !columnWidth.value) return

    const step = columnWidth.value + COLUMN_GAP
    // scrollWidth = N * columnWidth + (N-1) * gap = N * step - gap
    // 减去少量像素容差，避免浏览器亚像素舍入导致多算一页
    const newTotal = Math.max(1, Math.round((el.scrollWidth - 2 + COLUMN_GAP) / step))
    totalPages.value = newTotal

    if (newTotal > 1) {
      pageWidth.value = (el.scrollWidth - columnWidth.value) / (newTotal - 1)
    } else {
      pageWidth.value = step
    }

    if (currentPage.value >= newTotal) {
      currentPage.value = Math.max(0, newTotal - 1)
    }
  }

  function recalculate() {
    const viewport = viewportRef.value
    if (!viewport || !enabled.value) {
      totalPages.value = 0
      return
    }

    measureHeight()
    columnWidth.value = viewport.clientWidth
    pageWidth.value = columnWidth.value + COLUMN_GAP

    nextTick(() => {
      requestAnimationFrame(() => {
        measurePages()
        waitForResources()
      })
    })
  }

  // ---- 等待字体 & 图片加载完成后重新计算分页（之前计算的时候忘记了字体加载这回事来着） ----
  let imageCleanups: (() => void)[] = []

  function waitForResources() {
    cleanupImageListeners()
    // 字体加载完成（含解密字体）后重新测量
    document.fonts.ready.then(() => measurePages())
    // 图片加载完成后重新测量
    const el = contentRef.value
    if (!el) return
    for (const img of el.querySelectorAll('img')) {
      if (img.complete) continue
      const onDone = () => {
        img.removeEventListener('load', onDone)
        img.removeEventListener('error', onDone)
        measurePages()
      }
      img.addEventListener('load', onDone)
      img.addEventListener('error', onDone)
      imageCleanups.push(() => {
        img.removeEventListener('load', onDone)
        img.removeEventListener('error', onDone)
      })
    }
  }

  function cleanupImageListeners() {
    imageCleanups.forEach((fn) => fn())
    imageCleanups = []
  }

  // ---- 拖拽翻页 ----

  function startDrag() {
    isDragging.value = true
    dragOffset.value = 0
  }

  function moveDrag(offsetX: number) {
    // offsetX > 0 = 向右拖（上一页），offsetX < 0 = 向左拖（下一页）
    // 第一页不能再向右拖，最后一页不能再向左拖
    if (currentPage.value <= 0 && offsetX > 0) {
      dragOffset.value = 0
      return
    }
    if (currentPage.value >= totalPages.value - 1 && offsetX < 0) {
      dragOffset.value = 0
      return
    }
    // 限制拖拽不超过一页宽度
    const limit = pageWidth.value
    dragOffset.value = Math.max(-limit, Math.min(limit, offsetX))
  }

  function endDrag(offsetX: number) {
    isDragging.value = false

    const threshold = columnWidth.value * 0.2

    if (offsetX < -threshold && currentPage.value < totalPages.value - 1) {
      currentPage.value++
    } else if (offsetX > threshold && currentPage.value > 0) {
      currentPage.value--
    }

    // 松手后 dragOffset 归零，CSS transition 自动动画到目标页
    dragOffset.value = 0
  }

  // ---- 翻页 API ----

  /** 下一页，返回 false 表示已到最后一页需要切章 */
  function nextPage(): boolean {
    if (totalPages.value === 0) return true
    if (currentPage.value >= totalPages.value - 1) return false
    currentPage.value++
    return true
  }

  /** 上一页，返回 false 表示已到第一页需要切章 */
  function prevPage(): boolean {
    if (totalPages.value === 0) return true
    if (currentPage.value <= 0) return false
    currentPage.value--
    return true
  }

  function goToPage(n: number) {
    currentPage.value = Math.max(0, Math.min(n, Math.max(0, totalPages.value - 1)))
  }

  function goToXPath(xpath: string) {
    const el = contentRef.value
    if (!el || !xpath || !pageWidth.value) return
    try {
      const result = document.evaluate(xpath, el, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
      const target = result.iterateNext() as Element
      if (target) {
        const elRect = el.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()
        const elementLeft = targetRect.left - elRect.left + currentPage.value * pageWidth.value
        const targetPage = Math.floor(elementLeft / pageWidth.value)
        goToPage(targetPage)
      }
    } catch (e) {
      console.log(e)
    }
  }

  function readXPath(element: Element, context: Element): string {
    if (element === context) return '//*'
    let ix = 1
    const siblings = element.parentNode!.childNodes
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i]
      if (sibling === element) {
        return readXPath(element.parentNode as Element, context) + '/' + element.tagName.toLowerCase() + '[' + ix + ']'
      } else if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
        ix++
      }
    }
    return ''
  }

  function getCurrentPageXPath(): string | null {
    const el = contentRef.value
    if (!el || !pageWidth.value) return null

    const pageLeft = currentPage.value * pageWidth.value
    const pageRight = pageLeft + columnWidth.value

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, (node) => {
      return node.nodeValue!.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    })

    while (walker.nextNode()) {
      const textNode = walker.currentNode
      const element = textNode.parentElement
      if (!element) continue

      const rect = element.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const elementLeft = rect.left - elRect.left + currentPage.value * pageWidth.value

      if (elementLeft >= pageLeft && elementLeft < pageRight) {
        return readXPath(element, el)
      }
    }
    return null
  }

  // ResizeObserver
  let observer: ResizeObserver | null = null
  const debouncedRecalculate = debounce(recalculate, 50)

  function setupObserver() {
    cleanupObserver()
    const viewport = viewportRef.value
    if (!viewport || !enabled.value) return
    observer = new ResizeObserver(debouncedRecalculate)
    observer.observe(viewport)
  }

  function cleanupObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    cleanupImageListeners()
  }

  watch(
    [enabled, viewportRef, contentRef],
    () => {
      if (enabled.value && viewportRef.value && contentRef.value) {
        nextTick(() => {
          recalculate()
          setupObserver()
        })
      } else {
        cleanupObserver()
        totalPages.value = 0
        currentPage.value = 0
        columnWidth.value = 0
        columnHeight.value = 0
      }
    },
    { immediate: true },
  )

  onDeactivated(cleanupObserver)
  onUnmounted(cleanupObserver)

  return {
    currentPage,
    totalPages,
    columnWidth,
    pageWidth,
    isDragging,
    translateX,
    columnHeight,
    viewportStyle,
    columnStyle,
    startDrag,
    moveDrag,
    endDrag,
    nextPage,
    prevPage,
    goToPage,
    goToXPath,
    getCurrentPageXPath,
    recalculate,
  }
}
