<template>
  <q-layout view="hHh LpR fFf" class="bg-grey-1">
    <app-header />
    <app-sider />
    <app-container />
  </q-layout>
</template>

<script lang="tsx">
import { defineComponent } from 'vue'
import { AppSider, AppHeader, AppContainer } from '@/components/app/index'

export default defineComponent({
  components: {
    AppSider,
    AppHeader,
    AppContainer
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" scoped></style>
