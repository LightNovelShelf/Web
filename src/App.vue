<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <n-global-style />
    <n-layout class="app">
      <app-header />
      <n-layout class="content-wrapper" has-sider>
        <app-sider />
        <n-layout-content :native-scrollbar="false">
          <n-notification-provider>
            <n-message-provider>
              <n-loading-bar-provider>
                <div class="content">
                  <router-view />
                </div>
              </n-loading-bar-provider>
            </n-message-provider>
          </n-notification-provider>
          <!-- <n-layout-footer class="footer" bordered>我是footer，关于本站，用户协议等，可以设定仅在home出现</n-layout-footer> -->
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script lang="tsx">
import { computed, defineComponent, watch } from 'vue'
import { zhCN, dateZhCN, useOsTheme, darkTheme } from 'naive-ui'
import { AppSider, AppHeader } from '@/components/app/index'
import { useQuasar } from 'quasar'

export default defineComponent({
  components: {
    AppSider,
    AppHeader
  },
  setup() {
    const osThemeRef = useOsTheme()

    const $q = useQuasar()
    watch(
      () => $q.dark.isActive,
      (val) => {
        console.log(val ? 'On dark mode' : 'On light mode')
      }
    )

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
  --side-padding: 24px;
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
