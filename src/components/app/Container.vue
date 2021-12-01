<template>
  <q-page-container>
    <n-notification-provider>
      <n-message-provider>
        <n-loading-bar-provider>
          <div style="padding: 24px">
            <router-view v-slot="{ Component }">
              <!-- TODO 想加个q-transition--fade，但测试下来有点问题，以后还得加个keep-alive -->
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </div>
        </n-loading-bar-provider>
      </n-message-provider>
    </n-notification-provider>
  </q-page-container>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppContainer',
  setup() {
    return {}
  }
})
</script>

<style scoped></style>
