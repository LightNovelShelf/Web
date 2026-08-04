<template>
  <q-dialog v-model="model">
    <q-card class="point-log-card">
      <q-card-section class="row items-center q-pb-sm">
        <coin-icon v-if="kind === 'coin'" size="20px" class="q-mr-sm" />
        <div class="text-h6">{{ kind === 'coin' ? '金币记录' : '经验记录' }}</div>
        <q-space />
        <q-btn icon="mdiClose" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />

      <overlay-scrollbars-component
        class="point-log-scroll"
        :options="scrollbarOptions"
        :events="{ initialized: onInit, scroll: onScroll }"
        defer
      >
        <q-list separator>
          <q-item v-for="(item, i) in list" :key="i">
            <q-item-section>
              <q-item-label>{{ sourceLabel(item.Source, item.Amount) }}</q-item-label>
              <q-item-label caption>{{ toNow(parseTime(item.OccurredAt)) }}</q-item-label>
            </q-item-section>
            <q-item-section side class="items-end">
              <div :class="item.Amount >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-medium">
                {{ item.Amount >= 0 ? '+' : '' }}{{ item.Amount }}
              </div>
              <div class="text-caption text-opacity">余 {{ item.Balance }}</div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="loading" class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="32px" />
        </div>
        <div v-if="loaded && !loading && list.length === 0" class="column flex-center text-opacity q-py-xl">
          <q-icon name="mdiHistory" size="40px" />
          <div class="q-mt-sm">暂无记录</div>
        </div>
      </overlay-scrollbars-component>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useQuasar } from 'quasar'
import { computed, nextTick, ref, watch } from 'vue'

import { getErrMsg } from 'src/utils/getErrMsg'
import { parseTime, toNow } from 'src/utils/time'

import CoinIcon from 'src/components/points/CoinIcon.vue'

import { getCoinLog, getPointLog } from 'src/services/points'

import type { GetPointLog } from 'src/services/points/type'

const model = defineModel<boolean>({ default: false })
// 经验与金币流水结构完全一致，只有标题、取数接口与来源文案不同
const { kind = 'exp' } = defineProps<{ kind?: 'exp' | 'coin' }>()

const $q = useQuasar()
const list = ref<GetPointLog.Item[]>([])
const loading = ref(false)
const loaded = ref(false)
let page = 1
let finished = false
 
let os: any = null

const scrollbarOptions = computed(() => ({
  scrollbars: {
    theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
    autoHide: 'leave' as const,
    autoHideDelay: 300,
  },
}))

const SOURCE_LABEL: Record<string, string> = {
  SignIn: '签到',
  Read: '阅读',
  PublishNovel: '发布小说',
  PublishComic: '发布漫画',
  Thread: '发帖',
  Reply: '回复',
  BookComment: '评论',
  DownloadNovel: '下载小说',
  DownloadComic: '下载漫画',
  ShareNovel: '小说下载分成',
  ShareComic: '漫画下载分成',
  Admin: '系统',
}
// 消费类来源天然是负数，不该被当成「回收」
const SPEND_SOURCES = new Set(['DownloadNovel', 'DownloadComic'])
function sourceLabel(source: string, amount: number) {
  const label = SOURCE_LABEL[source] ?? source
  return amount < 0 && !SPEND_SOURCES.has(source) ? `${label}回收` : label
}

 
function onInit(instance: any) {
  os = instance
}

 
function onScroll(instance: any) {
  const viewport = instance.elements().viewport
  if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 200) {
    void loadMore()
  }
}

async function loadMore() {
  if (loading.value || finished) return
  loading.value = true
  try {
    const fetch = kind === 'coin' ? getCoinLog : getPointLog
    const res = await fetch({ Page: page, Size: 20 })
    list.value.push(...res.Data)
    loaded.value = true
    page += 1
    finished = page > res.TotalPages || res.Data.length === 0
  } catch (err) {
    finished = true
    $q.notify({ type: 'negative', message: getErrMsg(err) })
  } finally {
    loading.value = false
  }

  // 内容不足以滚动且还有更多时继续补齐
  await nextTick()
  if (!finished && os) {
    const viewport = os.elements().viewport
    if (viewport.scrollHeight <= viewport.clientHeight) void loadMore()
  }
}

watch(model, (open) => {
  if (open) {
    list.value = []
    page = 1
    finished = false
    loaded.value = false
    void loadMore()
  }
})
</script>

<style lang="scss" scoped>
.point-log-card {
  width: 460px;
  max-width: 92vw;
}

.point-log-scroll {
  max-height: 60vh;
}
</style>
