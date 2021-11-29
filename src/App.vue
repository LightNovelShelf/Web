<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <q-layout view="hHh LpR fFf" class="bg-grey-1">
      <app-header />
      <app-sider />
      <q-page-container>
        <n-notification-provider>
          <n-message-provider>
            <n-loading-bar-provider>
              <div style="padding: 24px 12px">
                <router-view v-slot="{ Component }">
                  <!-- TODO 想加个q-transition--fade，但测试下来有点问题，以后还得加个keep-alive -->
                  <component :is="Component" />
                </router-view>
              </div>
            </n-loading-bar-provider>
          </n-message-provider>
        </n-notification-provider>
      </q-page-container>
    </q-layout>
  </n-config-provider>
</template>

<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { zhCN, dateZhCN, useOsTheme, darkTheme } from 'naive-ui'
import { AppSider, AppHeader } from '@/components/app/index'

export default defineComponent({
  components: {
    AppSider,
    AppHeader
  },
  setup() {
    const osThemeRef = useOsTheme()

    return {
      zhCN,
      dateZhCN,
      theme: computed(() => (osThemeRef.value === 'dark' ? darkTheme : null))
    }
  }
})
</script>

<style lang="scss" scoped>
:global(.app) {
  --header-height: 64px;
  --side-padding: 12px;
  --slider-width: 220px;
  --content-padding-w: 36px;
  --content-padding-v: 24px;
}

.app {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1;

  .content-wrapper {
    position: absolute;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    right: 0;

    .content {
      padding: var(--content-padding-v) var(--content-padding-w);
    }

    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 48px;
    }
  }
}
</style>
