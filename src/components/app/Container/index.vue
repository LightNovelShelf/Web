<template>
  <q-page-container>
    <div :style="containerStyle">
      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <!-- TODO 想加个q-transition--fade，但测试下来有点问题 -->
          <keep-alive :exclude="['CollaboratorList']">
            <component :is="Component"></component>
          </keep-alive>
        </template>
        <template v-else>
          <div class="absolute-full column flex-center">
            <div>404</div>
          </div>
        </template>
      </router-view>
    </div>
  </q-page-container>
  <!-- 登陆页跳转 -->
  <authentication-guard />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import AuthenticationGuard from './AuthenticationGuard.vue'
import { useLayoutStore } from '@/components/app/useLayout'

export default defineComponent({
  components: { AuthenticationGuard },
  setup() {
    let layoutStore = useLayoutStore()

    return {
      containerStyle: computed(() => layoutStore.containerStyle)
    }
  }
})
</script>

<style scoped></style>
