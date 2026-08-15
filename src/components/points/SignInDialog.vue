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

        <div class="calendar">
          <div class="calendar__month text-center text-opacity q-mb-xs">{{ year }} 年 {{ month }} 月（UTC）</div>
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
                  'calendar__day--today': day === todayDate,
                }"
              >
                {{ day }}
              </div>
            </div>
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

const props = defineProps<{ streak: number; todaySigned: boolean }>()
const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{ signed: [] }>()

const $q = useQuasar()

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

// 仅展示当前月（UTC，与后端签到日期口径一致）
const now = new Date()
const year = ref(now.getUTCFullYear())
const month = ref(now.getUTCMonth() + 1)
const todayDate = now.getUTCDate()

const signing = ref(false)
const signedDays = ref<Set<number>>(new Set())

const cells = computed<(number | 0)[]>(() => {
  const firstWeekday = new Date(Date.UTC(year.value, month.value - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year.value, month.value, 0)).getUTCDate()
  const blanks: 0[] = Array<0>(firstWeekday).fill(0)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  return [...blanks, ...days]
})

async function loadCalendar() {
  try {
    const res = await getSignInCalendar({ Year: year.value, Month: month.value })
    signedDays.value = new Set(res.Days.map((d) => Number(d.SignDate.slice(8, 10))))
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

watch(model, (open) => {
  if (open) loadCalendar()
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
  }
}
</style>
