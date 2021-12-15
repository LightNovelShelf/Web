<template>
  <q-header
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
          <img v-if="user" src="https://q.qlogo.cn/headimg_dl?spec=100&dst_uin=1789263779" alt="" />
          <q-icon size="36px" v-else :name="icon.mdiAccountCircle"></q-icon>

          <q-menu :offset="[10, 5]" anchor="bottom left" self="top middle">
            <q-list separator>
              <q-item clickable v-ripple>
                <q-item-section>放点按钮</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section>放点按钮</q-item-section>
              </q-item>
            </q-list>
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

defineComponent({ name: 'Header' })

const appStore = useAppStore()
const { appName, user } = storeToRefs(appStore)
const { siderShow, headerHeight } = storeToRefs(useLayoutStore())
const search = ref('')

function changAppName() {
  appStore.asyncReverse()
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
</style>
