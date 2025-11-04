<template>
  <q-header
    :reveal="reveal"
    elevated
    :class="($q.dark.isActive ? 'bg-blue-grey-10' : '') + ' q-py-xs'"
    :height-hint="headerHeight"
  >
    <q-toolbar>
      <q-btn flat dense round aria-label="Menu" icon="mdiMenu" @click="siderShow = !siderShow" />

      <div
        class="row q-ml-xs cursor-pointer flex-center non-selectable"
        v-if="$q.screen.gt.xs"
        style="padding: 0 0 0 12px"
      >
        <div class="row flex-center">
          <q-icon size="24px" name="svguse:/icons.svg#book" />
        </div>
        <q-toolbar-title shrink @click="changAppName">
          {{ appName }}
        </q-toolbar-title>
      </div>

      <!-- form 是为了规避 focus-index 跳到意外的地方的问题 -->
      <form @submit.prevent>
        <search-input
          v-show="!hideSearchBar"
          placeholder="搜索"
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

      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn v-if="$q.screen.gt.xs" round dense flat>
          <!-- <q-badge color="red" floating> 1 </q-badge> -->
          <q-tooltip>通知</q-tooltip>
          <q-icon name="mdiBell"></q-icon>
        </q-btn>

        <q-btn round dense flat @click="goToNotification">
          <q-badge v-if="user && user.UnreadNotificationCount > 0" color="red" floating>
            {{ user.UnreadNotificationCount > 99 ? '99+' : user.UnreadNotificationCount }}
          </q-badge>
          <q-tooltip>消息</q-tooltip>
          <q-icon name="mdiMessageText"></q-icon>
        </q-btn>

        <div style="width: 10px" />

        <q-avatar size="36px" ref="avatar">
          <img v-if="user" :src="user.Avatar" alt="avatar" />
          <q-icon size="36px" v-else name="mdiAccountCircle"></q-icon>

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

              <div class="level-item">
                <template v-if="user.Level === 6">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col level-item__bar--tag level-item__bar--now">lv6</div>
                    <div class="col">
                      <q-linear-progress size="xs" :value="1" />
                    </div>
                    <div class="col level-item__bar--tag level-item__bar--next">--</div>
                  </div>

                  <div class="text-caption text-opacity level-item__text">恭喜你已经是满级了</div>
                </template>
                <template v-else>
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col level-item__bar--tag level-item__bar--now">lv{{ user.Level }}</div>
                    <div class="col">
                      <q-linear-progress size="xs" :value="0.3" />
                    </div>
                    <div class="col level-item__bar--tag level-item__bar--next">lv{{ user.Level + 1 }}</div>
                  </div>

                  <div class="text-caption text-opacity level-item__text">
                    当前经验0, 还需要114514经验升级到lv{{ user.Level + 1 }}
                  </div>
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
                  <q-item
                    clickable
                    v-ripple
                    :to="
                      (option.disabled ?? true) && option.route ? { name: option.route, params: option.params } : null
                    "
                  >
                    <q-item-section avatar>
                      <q-icon size="18px" :name="option.i" />
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
              <div class="row q-col-gutter-sm">
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
        </q-avatar>
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

import { longTermToken, sessionToken } from 'src/utils/session'

import { useAppStore } from 'stores/app'

import { useMedia } from 'src/composition/useMedia'

import { rebootSignalr } from 'src/services/internal/request'

import { useLayout } from './useLayout'
import SearchInput from '../SearchInput.vue'

const route = useRoute()

const hideSearchBar = computed(() => route.meta.hideSearchBar)

const $q = useQuasar()
const appStore = useAppStore()
const layout = useLayout()
const { appName, user } = storeToRefs(appStore)
const { siderShow, headerHeight, siderBreakpoint } = layout
const searchKey = ref('')
const reveal = useMedia(
  computed(() => `(max-width: ${siderBreakpoint.value}px)`),
  window.innerWidth <= siderBreakpoint.value,
)
const router = useRouter()

const { width } = useWindowSize()
const isWideScreen = computed(() => width.value > 768)
const searchInputWidth = computed(() => {
  if (isWideScreen.value) {
    return (visible: boolean) => (visible ? '40vw' : 'auto')
  }
  return (visible: boolean) => '50vw'
})

const userInfoMenuOptions: Array<Record<string, any>> = [
  {
    label: '个人中心',
    key: 'Account',
    route: 'UserProfile',
    icon: 'mdiAccountOutline',
  },
  {
    label: '发布管理',
    key: 'Contribution',
    route: 'UserPublish',
    icon: 'mdiAccountCog',
  },
  {
    label: '我的书架',
    key: 'MyShelf',
    route: 'MyShelf',
    icon: 'mdiFolderHeartOutline',
  },
  {
    label: '网站设置',
    key: 'Setting',
    route: 'Setting',
    icon: 'mdiCog',
  },
]

function onSearch(keywords: string, exact: boolean) {
  router.push({ name: 'Search', query: { keywords: keywords, exact: exact ? '1' : '' } })
  searchKey.value = ''
}
function changAppName() {
  appStore.asyncReverse()
}
function goToNotification() {
  router.push({ name: 'Notification' })
}
function logout() {
  $q.dialog({
    title: '提示',
    message: '你确定要退出登录吗？',
    cancel: true,
  }).onOk(async () => {
    appStore.$reset()
    await longTermToken.set('')
    sessionToken.set('')
    await rebootSignalr()
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
      margin-bottom: 12px;
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
