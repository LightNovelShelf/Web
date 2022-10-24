<template>
    <div>
        <div ref="contentRef" class="read" v-html="props.html" style="position: relative; z-index: 1"
            @click="manageScrollClick" />
        <div class="v-viewer" ref="viewerRef" v-viewer>
            <img :src="showImage.src" :alt="showImage.alt" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { scroll, useQuasar } from 'quasar'
import { useSettingStore } from 'src/stores/setting'
import { useLayout } from './app/useLayout'

const $q = useQuasar()
const router = useRouter()
const layout = useLayout()
const settingStore = useSettingStore()
const { headerOffset } = layout
const props = defineProps<{ html: string }>()
const contentRef = ref<HTMLElement>()
const viewerRef = ref<HTMLElement>()
const { readSetting } = settingStore
const showImage = reactive({
    src: null,
    alt: ''
})
const emits = defineEmits(['previewImg'])

function manageScrollClick(event: any) {
    // @ts-ignore
    if (readSetting.tapToScroll && !viewerRef.value.$viewer.isShown) {
        let h = window.innerHeight
        if (event.y < 0.25 * h || event.y > 0.75 * h) {
            let target = scroll.getScrollTarget(contentRef.value)
            let offset = scroll.getVerticalScrollPosition(target)
            scroll.setVerticalScrollPosition(target, event.y < 0.25 * h ? offset - h * 0.75 : offset + h * 0.75, 200) // 最后一个参数为duration
        }
    }
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

function readerHandleLinkClick(e: MouseEvent) {
    if (!contentRef.value) return
    if (!contentRef.value.contains(<Node>e.target)) return
    let a: HTMLElement = null
    for (let ele = <Node>e.target; ele !== contentRef.value && !a; ele = ele.parentNode) {
        if (ele.nodeName === 'A') a = <HTMLElement>ele
    }
    if (!a) return

    e.preventDefault()
    const href = a.getAttribute('href')

    // if href is id
    if (href === null) return
    if (href.startsWith('#')) {
        const target = document.getElementById(href.replace('#', ''))
        document.scrollingElement.scrollTop = target.getBoundingClientRect().top - headerOffset.value
        return
    }

    const url = makeUrl(href)
    if (!url) return

    if (location.origin === url.origin) router.push(url.pathname)
    else window.open(url)
}

function previewImg(event) {
    showImage.src = event.target.src
    showImage.alt = event.target.alt
    // @ts-ignore
    viewerRef.value.$viewer.show()
    event.stopPropagation()
    emits('previewImg', event)
}

onMounted(() => {
    contentRef.value.querySelectorAll('.duokan-image-single img').forEach((element: any) => {
        element.onclick = previewImg
    })
    document.body.addEventListener('click', readerHandleLinkClick)
})

onActivated(() => {
    document.body.addEventListener('click', readerHandleLinkClick)
})
onDeactivated(() => {
    document.body.removeEventListener('click', readerHandleLinkClick)
})

defineExpose({ contentRef, previewImg })
</script>