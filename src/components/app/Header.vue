<template>
  <q-header
    :reveal="reveal"
    elevated
    :class="($q.dark.isActive ? 'bg-blue-grey-10' : '') + ' q-py-xs'"
    :height-hint="headerHeight"
  >
    <q-toolbar>
      <q-btn flat dense round aria-label="Menu" icon="mdiMenu" @click="siderShow = !siderShow" />

      <div class="row q-ml-xs flex-center non-selectable" v-if="$q.screen.gt.xs" style="padding: 0 0 0 12px">
        <div class="row flex-center">
          <q-icon size="24px" name="svguse:/icons.svg#book" />
        </div>
        <q-toolbar-title shrink>轻书架</q-toolbar-title>
      </div>

      <!-- form 是为了规避 focus-index 跳到意外的地方的问题 -->
      <form @submit.prevent>
        <search-input
          :placeholder="searchPlaceholder"
          dark
          dense
          standout
          class="q-ml-md"
          v-model="searchKey"
          :width="searchInputWidth"
          max-width="unset"
          @search="onSearch"
        />
      </form>

      <q-space />

      <div class="row items-center no-wrap gap-8">
        <q-btn round dense flat @click="goToNotification">
          <q-badge v-if="user && user.UnreadNotificationCount > 0" color="red" floating>
            {{ user.UnreadNotificationCount > 99 ? '99+' : user.UnreadNotificationCount }}
          </q-badge>
          <q-tooltip>通知</q-tooltip>
          <q-icon name="mdiBellOutline"></q-icon>
        </q-btn>

        <q-btn round dense flat @click="goToDirectMessage">
          <q-badge v-if="user && user.UnreadDirectMessageCount > 0" color="red" floating>
            {{ user.UnreadDirectMessageCount > 99 ? '99+' : user.UnreadDirectMessageCount }}
          </q-badge>
          <q-tooltip>私信</q-tooltip>
          <q-icon name="mdiMessageText"></q-icon>
        </q-btn>

        <div style="width: 10px" />

        <base-avatar :src="user?.Avatar" :name="user?.UserName ?? '访客'" size="36px">
          <q-menu
            class="avatar-popover"
            :offset="[-30, 5]"
            anchor="bottom left"
            self="top right"
            style="border-radius: 8px"
          >
            <q-list class="avatar-panel-popover" v-if="user">
              <div class="nickname-item text-center">
                <q-item>
                  <q-item-section>
                    <div>{{ user.UserName }}</div>
                    <div class="text-caption text-opacity">{{ user['Role'].Name }}</div>
                  </q-item-section>
                </q-item>
              </div>

              <div class="coin-item">
                <coin-icon size="18px" />
                <span>{{ growth?.Coin ?? 0 }}</span>
              </div>

              <div class="level-item">
                <template v-if="growthLevel >= 6">
                  <div class="row items-center gap-8">
                    <div class="col level-item__bar--tag level-item__bar--now">lv6</div>
                    <div class="col">
                      <q-linear-progress size="xs" :value="1" />
                    </div>
                    <div class="col level-item__bar--tag level-item__bar--next">--</div>
                  </div>

                  <div class="text-caption text-opacity level-item__text">恭喜你已经是满级了</div>
                </template>
                <template v-else>
                  <div class="row items-center gap-8">
                    <div class="col level-item__bar--tag level-item__bar--now">lv{{ growthLevel }}</div>
                    <div class="col">
                      <q-linear-progress size="xs" :value="expProgress" />
                    </div>
                    <div class="col level-item__bar--tag level-item__bar--next">lv{{ growthLevel + 1 }}</div>
                  </div>

                  <div class="text-caption text-opacity level-item__text">{{ expText }}</div>
                </template>
              </div>

              <div class="counts-item">
                <div class="row justify-between">
                  <a class="col single-count-item">
                    <div class="count-num">0</div>
                    <div class="count-text">关注</div>
                  </a>
                  <a class="col single-count-item">
                    <div class="count-num">0</div>
                    <div class="count-text">粉丝</div>
                  </a>
                  <a class="col single-count-item">
                    <div class="count-num">0</div>
                    <div class="count-text">发帖</div>
                  </a>
                </div>
              </div>

              <div class="link-item">
                <template v-for="option in userInfoMenuOptions" :key="option.key">
                  <q-item clickable v-ripple :to="option.to">
                    <q-item-section avatar>
                      <q-icon size="18px" :name="option.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ option.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon size="18px" name="mdiChevronRight" />
                    </q-item-section>
                  </q-item>
                </template>
              </div>

              <q-separator style="margin: 10px 0" />

              <div class="logout-item">
                <q-item clickable v-ripple @click="logout">
                  <q-item-section avatar>
                    <q-icon size="18px" name="mdiLogoutVariant" />
                  </q-item-section>
                  <q-item-section>退出登录</q-item-section>
                </q-item>
              </div>
            </q-list>

            <div v-else class="q-pa-sm">
              <div class="row gap-8">
                <div>
                  <router-link :to="{ name: 'Login' }">
                    <q-btn color="primary">登录</q-btn>
                  </router-link>
                </div>
                <div>
                  <router-link :to="{ name: 'Register' }">
                    <q-btn color="primary">注册</q-btn>
                  </router-link>
                </div>
              </div>
            </div>
          </q-menu>
        </base-avatar>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'

import { useSessionStore } from '@/stores/session'

import BaseAvatar from '@/components/BaseAvatar.vue'
import CoinIcon from '@/components/points/CoinIcon.vue'

import { useMedia } from '@/composition/useMedia'

import { logout as endSession } from '@/services/auth'

import SearchInput from '../SearchInput.vue'
import { accountNavigation } from './navigation'
import { useLayout } from './useLayout'

import type { SearchMode } from '@/services/book/types'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const appStore = useSessionStore()
const layout = useLayout()
const { user } = storeToRefs(appStore)
const { siderShow, headerHeight, siderBreakpoint } = layout

const searchPlaceholder = computed(() => (route.meta.searchTab === 'Comic' ? '搜索漫画' : '搜索小说'))
const growth = computed(() => user.value?.Growth)
const growthLevel = computed<number>(() => growth.value?.GrowthLevel ?? 0)
const expProgress = computed<number>(() => {
  const current = growth.value
  if (!current || current.NextLevelExp == null) return 0
  const span = current.NextLevelExp - current.CurrentLevelExp
  if (span <= 0) return 0
  return Math.min(1, Math.max(0, (current.Exp - current.CurrentLevelExp) / span))
})
const expText = computed<string>(() => {
  const current = growth.value
  if (!current) return ''
  if (current.NextLevelExp == null) return '恭喜你已经是满级了'
  return `当前经验 ${current.Exp}，还需 ${current.NextLevelExp - current.Exp} 经验升级到 lv${current.GrowthLevel + 1}`
})
const searchKey = ref('')
const reveal = useMedia(
  computed(() => `(max-width: ${siderBreakpoint.value}px)`),
  window.innerWidth <= siderBreakpoint.value,
)

const { width } = useWindowSize()
const isWideScreen = computed(() => width.value > 768)
const searchInputWidth = computed(() => {
  if (isWideScreen.value) return (visible: boolean) => (visible ? '40vw' : 'auto')
  return () => '50vw'
})
const userInfoMenuOptions = accountNavigation

function onSearch(keywords: string, mode: SearchMode) {
  const tab = route.meta.searchTab as string | undefined
  void router.push({ name: 'Search', query: { keywords, mode, ...(tab ? { tab } : {}) } })
  searchKey.value = ''
}

function goToNotification() {
  void router.push({ name: 'Notification' })
}

function goToDirectMessage() {
  void router.push({ name: 'DirectMessage' })
}

function logout() {
  $q.dialog({
    title: '提示',
    message: '你确定要退出登录吗？',
    cancel: true,
  }).onOk(async () => {
    appStore.clearUser()
    try {
      await endSession()
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrMsg(error) })
    }
  })
}
</script>

<style lang="scss" scoped>
.avatar-popover {
  .avatar-panel-popover {
    width: 300px;
    padding: 10px 20px;

    .nickname-item {
      font-size: 18px;
      font-weight: 500;
    }

    .coin-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: 500;
      color: inherit;
    }

    .level-item {
      margin-bottom: 6px;

      &__bar--tag {
        flex: none;
      }

      &__bar--next {
        color: $grey-6;
      }

      &__text {
        color: $grey-6;
      }
    }

    .counts-item {
      margin-bottom: 12px;
      padding: 0 20px;

      .single-count-item {
        flex: none;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-between;
        transition: color 0.2s;
        cursor: pointer;

        .count-num {
          font-weight: 500;
          font-size: 16px;
          transition: color 0.2s;
        }

        .count-text {
          font-size: 12px;
          color: $grey-7;
          font-weight: 400;
          transition: color 0.2s;
        }

        &:hover .count-num,
        &:hover .count-text {
          color: $light-blue-13 !important;
        }
      }
    }

    .link-item,
    .logout-item {
      color: $grey-9;
    }

    :deep(.q-item__section--avatar) {
      min-width: unset !important;
    }

    :deep(.q-item) {
      border-radius: 8px;
      margin-bottom: 2px;
      padding: 10px 14px;
    }
  }
}

:deep(.q-item) {
  min-height: unset !important;
}
</style>
