<template>
  <q-drawer
    v-model="siderShow"
    show-if-above
    bordered
    :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'"
    :width="240"
    :breakpoint="siderBreakpoint"
  >
    <q-scroll-area class="fit">
      <q-list padding>
        <template v-for="item in sidebarNavigation" :key="item.key">
          <q-separator v-if="item.kind === 'separator'" class="q-my-md" />
          <q-item
            v-else
            :to="item.kind === 'route' ? item.to : undefined"
            :href="item.kind === 'external' ? item.href : undefined"
            :target="item.kind === 'external' ? '_blank' : undefined"
            :rel="item.kind === 'external' ? 'noopener noreferrer' : undefined"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon color="grey" :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="temp-box" />

      <div class="absolute-bottom column flex-center" style="bottom: 24px">
        <div v-if="commitSha === 'dev'" class="q-pb-sm">网页版本：dev</div>
        <div v-else class="q-pb-sm">
          网页版本：
          <a :href="`https://github.com/LightNovelShelf/Web/tree/${commitSha}`" target="_blank">{{ commitSha }}</a>
        </div>
        <div class="row items-center">
          <q-icon
            left
            :color="realtimeConnectionStatus === 'online' ? 'positive' : 'negative'"
            size="24px"
            name="mdiBroadcast"
          />
          <span v-if="realtimeConnectionStatus === 'online'">当前在线</span>
          <span v-else-if="realtimeConnectionStatus === 'reconnecting'">正在尝试重新连接</span>
          <span v-else>当前离线，等待连接</span>
        </div>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { realtimeConnectionStatus } from '@/services/transport'

import { sidebarNavigation } from './navigation'
import { useLayout } from './useLayout'

const commitSha = import.meta.env.VUE_COMMIT_SHA
const { siderShow, siderBreakpoint } = useLayout()
</script>

<style scoped lang="scss">
.temp-box {
  height: 80px;
}
</style>
