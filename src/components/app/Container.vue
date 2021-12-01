<template>
  <q-page-container>
    <n-notification-provider>
      <n-message-provider>
        <n-loading-bar-provider>
          <div :style="{ padding: padding }">
            <router-view v-slot="{ Component }">
              <!-- TODO 想加个q-transition--fade，但测试下来有点问题 -->
              <keep-alive :exclude="['CollaboratorList']">
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </div>
        </n-loading-bar-provider>
      </n-message-provider>
    </n-notification-provider>
  </q-page-container>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()
const padding = computed(() => ($q.screen.xs ? '12px' : '12px'))
</script>

<style scoped></style>
