<template>
  <div ref="contentRef" class="html-reader print-hide" v-html="props.html" @click="clickHandle" />
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { PROVIDE } from 'src/const/provide'
import { scroll, useQuasar } from 'quasar'
import { useSettingStore } from 'stores/setting'
import { useLayout } from '../app/useLayout'

const $q = useQuasar()
const router = useRouter()
const layout = useLayout()
const settingStore = useSettingStore()
const imagePreview = inject<any>(PROVIDE.IMAGE_PREVIEW)

const { headerOffset } = layout
const { readSetting } = settingStore

const props = defineProps<{ html: string }>()
const contentRef = ref<HTMLElement>()
const viewerRef = ref<HTMLElement>()

function getElement(event: Event) {
  let target = <Node>event.target
  if (target instanceof Element) return target
  if (target.parentElement instanceof Element) return target.parentElement
  return null
}

function clickHandle(event: Event) {
  let target = getElement(event)
  if (
    target instanceof HTMLImageElement &&
    (target.parentElement.classList.contains('duokan-image-single') ||
      target.parentElement.classList.contains('image-preview'))
  ) {
    imagePreview.show(target.src, target.alt)
  } else if (target instanceof HTMLAnchorElement) {
    const reservedWord = ['_self', '_blank', '_parent', '_top']
    const protocol = ['file:', 'ftp:', 'mailto:']
    if (reservedWord.indexOf(target.getAttribute('href')) !== -1) return
    for (const p of protocol) {
      if (target.getAttribute('href').startsWith(p)) return
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
    document.scrollingElement.scrollTop = target.getBoundingClientRect().top - headerOffset.value
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
    if (/^\/\//.test(link)) return new URL(`https:${link}`, location.origin)
    // origin ex. www.lightnovel.app
    if (/^[a-z0-9-]+([.][a-z0-9-]+)+$/.test(link)) return new URL(`https://${link}`, location.origin)
    // same site
    if (/^\//.test(link) && router.resolve(link).matched.length !== 0) return new URL(link, location.origin)
  } catch {
    return null
  }

  return null
}

function manageScrollClick(event: any) {
  // @ts-ignore
  if (readSetting.tapToScroll && !imagePreview.isShow) {
    let h = window.innerHeight
    if (event.y < 0.25 * h || event.y > 0.75 * h) {
      let target = scroll.getScrollTarget(contentRef.value)
      let offset = scroll.getVerticalScrollPosition(target)
      scroll.setVerticalScrollPosition(target, event.y < 0.25 * h ? offset - h * 0.75 : offset + h * 0.75, 200) // 最后一个参数为duration
    }
  }
}

defineExpose({ contentRef })
</script>

<style scoped lang="scss"></style>
