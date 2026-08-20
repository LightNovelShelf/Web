<template>
  <div
    ref="contentRef"
    class="html-reader print-hide"
    v-html="preparedHtml"
    @click="clickHandle"
    @load.capture="clearSystemImageLoadingState"
  />
</template>

<script lang="ts" setup>
import { scroll, useQuasar } from 'quasar'
import { computed, inject, nextTick, watch } from 'vue'

import { clearLoadedSystemImageStates, clearSystemImageLoadingState, prepareSystemImages } from '@/utils/systemImage'

import { useSettingStore } from '@/stores/setting'

import { useLayout } from '@/components/app/useLayout'

import { PROVIDE } from '@/const/provide'

const $q = useQuasar()
const router = useRouter()
const layout = useLayout()
const settingStore = useSettingStore()
const imagePreview = inject<any>(PROVIDE.IMAGE_PREVIEW)

const { headerOffset } = layout
const { readSetting } = settingStore

const props = defineProps<{ html: string }>()
/** 翻页模式下点击左右边缘要翻页，翻页状态由父级维护，这里只上报方向 */
const emit = defineEmits<{ flip: [delta: 1 | -1] }>()
const contentRef = ref<HTMLElement>()
const preparedHtml = computed(() => {
  if (!props.html) return props.html
  const template = document.createElement('template')
  template.innerHTML = props.html
  prepareSystemImages(template.content, 2048)
  return template.innerHTML
})
watch(
  preparedHtml,
  async () => {
    await nextTick()
    if (contentRef.value) clearLoadedSystemImageStates(contentRef.value)
  },
  { immediate: true, flush: 'post' },
)

function getElement(event: Event) {
  const target = <Node>event.target
  if (target instanceof Element) return target
  if (target.parentElement instanceof Element) return target.parentElement
  return null
}

function clickHandle(event: Event) {
  const target = getElement(event)
  if (
    target instanceof HTMLImageElement &&
    !target.classList.contains('no-preview') &&
    (target.parentElement?.classList.contains('duokan-image-single') ||
      target.parentElement?.classList.contains('image-preview') ||
      target.parentElement?.classList.contains('illus'))
  ) {
    imagePreview.show(target.src, target.alt)
  } else if (target instanceof HTMLAnchorElement) {
    const reservedWord = ['_self', '_blank', '_parent', '_top']
    const protocol = ['file:', 'ftp:', 'mailto:']
    if (reservedWord.indexOf(target.getAttribute('href')!) !== -1) return
    for (const p of protocol) {
      if (target.getAttribute('href')?.startsWith(p)) return
    }
    event.preventDefault()
    readerHandleLinkClick(target)
  } else {
    manageScrollClick(event)
  }
}

function readerHandleLinkClick(a: HTMLAnchorElement) {
  const anotherUrl = ['www.lightnovel.app', 'www.acgdmzy.com', 'next.acgdmzy.com']
  const href = a.getAttribute('href')

  // if href is id
  if (href === null) return
  // 如果单独的一个#是回到顶部
  // https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a#attr-href
  if (href.startsWith('#')) {
    if (href.length === 1 || href === '#top') scrollTo(0, 0)
    const target = document.getElementById(href.replace('#', ''))
    document!.scrollingElement!.scrollTop = target!.getBoundingClientRect().top - headerOffset.value
    return
  }

  const url = makeUrl(href)
  if (!url) return
  if (location.origin === url.origin || anotherUrl.indexOf(url.hostname) !== -1) router.push(url.pathname)
  else window.open(url)
}

function makeUrl(link: string) {
  try {
    // normal link
    if (/^https?:\/\//.test(link)) return new URL(link, location.origin)
    if (link.startsWith('//')) return new URL(`https:${link}`, location.origin)
    // origin ex. www.lightnovel.app
    if (/^[a-z0-9-]+([.][a-z0-9-]+)+$/.test(link)) return new URL(`https://${link}`, location.origin)
    // same site
    if (link.startsWith('/') && router.resolve(link).matched.length !== 0) return new URL(link, location.origin)
  } catch {
    return null
  }

  return null
}

function manageScrollClick(event: any) {
  if (imagePreview.isShow) return
  if (readSetting.readMode === 'flip') {
    const w = window.innerWidth
    if (event.x < 0.3 * w) emit('flip', -1)
    else if (event.x > 0.7 * w) emit('flip', 1)
    return
  }
  if (readSetting.tapToScroll) {
    const h = window.innerHeight
    if (event.y < 0.25 * h || event.y > 0.75 * h) {
      const target = scroll.getScrollTarget(contentRef.value!)
      const offset = scroll.getVerticalScrollPosition(target)
      scroll.setVerticalScrollPosition(target, event.y < 0.25 * h ? offset - h * 0.75 : offset + h * 0.75, 200) // 最后一个参数为duration
    }
  }
}

defineExpose({ contentRef })
</script>

<style scoped lang="scss">
:deep() {
  & {
    all: unset;
  }

  @import '../../css/read';
}
</style>
