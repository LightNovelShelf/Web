<template>
  <q-dialog v-model="model">
    <q-card class="sign-in-card">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">每日签到</div>
        <q-space />
        <q-btn icon="mdiClose" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />

      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1">
              连续签到 <span class="text-primary text-weight-bold">{{ streak }}</span> 天
            </div>
            <div class="text-caption text-opacity">每日签到累积经验，连签有额外奖励</div>
          </div>
          <q-btn
            :label="todaySigned ? '今日已签到' : '签到'"
            :disable="todaySigned"
            :loading="signing"
            color="primary"
            unelevated
            @click="doSignIn"
          />
        </div>

        <div class="row items-center justify-between q-mb-sm">
          <div class="text-caption text-opacity">补签卡 {{ makeupCards }} 张 · 点日历里的漏签日即可补签</div>
          <q-btn flat dense size="sm" color="primary" label="去商城" :to="{ name: 'Shop' }" v-close-popup />
        </div>

        <div class="calendar">
          <div class="calendar__month row items-center justify-center q-mb-xs">
            <q-btn icon="mdiChevronLeft" flat round dense size="sm" :disable="!canGoPrev" @click="shiftMonth(-1)" />
            <span class="text-opacity q-mx-sm">{{ year }} 年 {{ month }} 月（UTC）</span>
            <q-btn icon="mdiChevronRight" flat round dense size="sm" :disable="!canGoNext" @click="shiftMonth(1)" />
          </div>
          <div class="calendar__grid calendar__week text-opacity">
            <div v-for="w in weekLabels" :key="w" class="calendar__cell">{{ w }}</div>
          </div>
          <div class="calendar__grid">
            <div v-for="(day, i) in cells" :key="i" class="calendar__cell">
              <div
                v-if="day"
                class="calendar__day"
                :class="{
                  'calendar__day--signed': signedDays.has(day),
                  'calendar__day--today': isToday(day),
                  'calendar__day--makeup': canMakeUp(day),
                }"
                @click="canMakeUp(day) && doMakeUp(day)"
              >
                {{ day }}
              </div>
            </div>
          </div>
          <div class="text-caption text-opacity q-mt-sm">
            虚线圈出的是最近 {{ makeupWindowDays }} 天内可补签的日子，补签后连续天数按补签结果重算
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed, ref, watch } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { getSignInCalendar, signIn } from '@/services/points'
import { SIGN_MAKEUP_KEY, getMyItems, useSignMakeupCard } from '@/services/shop'

const props = defineProps<{ streak: number; todaySigned: boolean }>()
const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{ signed: [] }>()

const $q = useQuasar()

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

// 后端 PointService.SignMakeupWindowDays
const makeupWindowDays = 30

// 签到日期口径与后端一致，全部按 UTC 天算
const now = new Date()
const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
const makeupFloorUtc = todayUtc - makeupWindowDays * 86400000

const year = ref(now.getUTCFullYear())
const month = ref(now.getUTCMonth() + 1)

const signing = ref(false)
const makeupCards = ref(0)
const signedDays = ref<Set<number>>(new Set())

const cells = computed<number[]>(() => {
  const firstWeekday = new Date(Date.UTC(year.value, month.value - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year.value, month.value, 0)).getUTCDate()
  const blanks: 0[] = Array<0>(firstWeekday).fill(0)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  return [...blanks, ...days]
})

// 补签窗口最早能落到上一个月，日历要能翻过去
const canGoPrev = computed(() => Date.UTC(year.value, month.value - 1, 1) > makeupFloorUtc)
const canGoNext = computed(
  () => Date.UTC(year.value, month.value - 1, 1) < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
)

function dayUtc(day: number) {
  return Date.UTC(year.value, month.value - 1, day)
}

function isToday(day: number) {
  return dayUtc(day) === todayUtc
}

function canMakeUp(day: number) {
  const date = dayUtc(day)
  return makeupCards.value > 0 && date < todayUtc && date >= makeupFloorUtc && !signedDays.value.has(day)
}

function shiftMonth(delta: number) {
  const shifted = new Date(Date.UTC(year.value, month.value - 1 + delta, 1))
  year.value = shifted.getUTCFullYear()
  month.value = shifted.getUTCMonth() + 1
  void loadCalendar()
}

async function loadCalendar() {
  try {
    const res = await getSignInCalendar({ Year: year.value, Month: month.value })
    signedDays.value = new Set(res.Days.map((d) => Number(d.SignDate.slice(8, 10))))
  } catch (err) {
    $q.notify({ type: 'negative', message: getErrMsg(err) })
  }
}

async function loadCards() {
  try {
    const res = await getMyItems()
    makeupCards.value = res.Items.find((x) => x.Key === SIGN_MAKEUP_KEY)?.Quantity ?? 0
  } catch (err) {
    $q.notify({ type: 'negative', message: getErrMsg(err) })
  }
}

async function doSignIn() {
  if (props.todaySigned) return
  signing.value = true
  try {
    const res = await signIn()
    // 经验增量由全局 OnGrowthUpdate 统一提示，这里只报签到结果
    $q.notify({ type: 'positive', message: `签到成功，连签 ${res.Streak} 天` })
    await loadCalendar()
    emit('signed')
  } catch (err) {
    $q.notify({ type: 'negative', message: getErrMsg(err) })
  } finally {
    signing.value = false
  }
}

function doMakeUp(day: number) {
  const date = new Date(dayUtc(day)).toISOString().slice(0, 10)
  $q.dialog({
    title: '使用补签卡',
    message: `消耗 1 张补签卡补签 ${date}？`,
    cancel: true,
  }).onOk(async () => {
    try {
      const res = await useSignMakeupCard({ Date: date })
      makeupCards.value = res.Owned
      $q.notify({ type: 'positive', message: `补签成功，当天连签 ${res.Streak} 天` })
      await loadCalendar()
      emit('signed')
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrMsg(err) })
    }
  })
}

watch(model, (open) => {
  if (open) {
    void loadCalendar()
    void loadCards()
  }
})
</script>

<style lang="scss" scoped>
.sign-in-card {
  width: 360px;
  max-width: 92vw;
}

.calendar {
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  &__week {
    font-size: 12px;
    margin-bottom: 4px;
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
  }

  &__day {
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
    font-size: 13px;

    &--signed {
      background: $primary;
      color: #fff;
    }

    &--today {
      outline: 2px solid $secondary;
    }

    &--makeup {
      cursor: pointer;
      border: 1px dashed $warning;
      line-height: 28px;
    }
  }
}
</style>
