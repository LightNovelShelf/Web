<template>
  <q-header
    :reveal="reveal"
    elevated
    :class="($q.dark.isActive ? 'bg-blue-grey-10 text-secondary ' : 'bg-white text-grey-8') + ' q-py-xs'"
    :height-hint="headerHeight"
  >
    <q-toolbar>
      <q-btn flat dense round aria-label="Menu" :icon="icon.mdiMenu" @click="siderShow = !siderShow" />

      <div class="row q-ml-xs cursor-pointer flex-center non-selectable" v-if="$q.screen.gt.xs" style="padding: 0 12px">
        <div class="row flex-center">
          <q-icon size="24px" :name="icon.mdiInformation" />
          <q-tooltip anchor="bottom right" self="top right"> 欢迎来稿一个新的网站图标 </q-tooltip>
        </div>
        <q-toolbar-title shrink class="text-weight-bold" @click="changAppName">
          {{ appName }}
        </q-toolbar-title>
      </div>

      <q-input dense outlined square v-model="search" placeholder="搜索" />

      <q-space />

      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn round dense flat>
          <q-badge color="red" text-color="white" floating> 22 </q-badge>
          <q-tooltip>通知</q-tooltip>
          <q-icon :name="icon.mdiBell"></q-icon>
        </q-btn>

        <q-btn round dense flat>
          <q-badge color="red" text-color="white" floating> 99+ </q-badge>
          <q-tooltip>通知</q-tooltip>
          <q-icon :name="icon.mdiMessageText"></q-icon>
        </q-btn>

        <div style="width: 10px" />

        <q-avatar size="36px" ref="avatar">
          <img v-if="user" :src="user.Avatar" alt="avatar" />
          <q-icon size="36px" v-else :name="icon.mdiAccountCircle"></q-icon>

          <q-menu :offset="[-30, 5]" anchor="bottom left" self="top right">
            <q-list v-if="user">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="user.Avatar" alt="avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{ user.UserName }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-ripple>
                <q-item-section>个人中心</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>网站设置</q-item-section>
              </q-item>
              <q-item>
                <q-btn @click="logout" color="red" class="full-width flex-center row">
                  <q-icon size="18px" left :name="icon.mdiLogoutVariant" />
                  <span>退出登录</span>
                </q-btn>
              </q-item>
            </q-list>

            <div v-else class="q-pa-sm">
              <div class="row q-col-gutter-sm">
                <div>
                  <router-link :to="{ name: 'Login' }">
                    <q-btn color="primary">登录</q-btn>
                  </router-link>
                </div>
                <div><q-btn color="primary">注册</q-btn></div>
              </div>
            </div>
          </q-menu>
        </q-avatar>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script lang="tsx" setup>
import { computed, defineComponent, ref } from 'vue'
import { icon } from '@/plugins/icon'
import { useAppStore } from '@/store'
import { useLayoutStore } from './useLayout'
import { storeToRefs } from 'pinia'
import { useMedia } from '@/composition/useMedia'
import { longTermToken, sessionToken } from '@/utils/session'
import { useQuasar } from 'quasar'
import { rebootSignalr } from '@/services/internal/request'

defineComponent({ name: 'Header' })

const $q = useQuasar()
const appStore = useAppStore()
const layoutStore = useLayoutStore()
const { appName, user } = storeToRefs(appStore)
const { siderShow, headerHeight, siderBreakpoint } = storeToRefs(layoutStore)
const search = ref('')
const reveal = useMedia(
  computed(() => `(max-width: ${siderBreakpoint.value}px)`),
  window.innerWidth <= siderBreakpoint.value
)

function changAppName() {
  appStore.asyncReverse()
}
function logout() {
  $q.dialog({
    title: '提示',
    message: '你确定要退出登录吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    appStore.$reset()
    await longTermToken.set('')
    sessionToken.set('')
    await rebootSignalr()
  })
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 var(--side-padding);

  .header-title {
    align-items: center;
    font-size: 24px;
    width: calc(var(--slider-width) - var(--side-padding) + var(--content-padding-w));
  }

  .search {
    min-width: 200px;
    max-width: 300px;
  }

  .action:nth-child(n) {
    cursor: pointer;
  }
}

:deep(.q-item) {
  min-height: unset !important;
}
</style>
