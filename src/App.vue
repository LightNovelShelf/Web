<template>
  <q-layout
    view="hHh LpR fFf"
    :class="[quasar.dark.isActive ? '' : 'bg-grey-1', { 'immersive-layout': isImmersiveRoute }]"
  >
    <app-header v-if="!isImmersiveRoute" />
    <app-side v-if="!isImmersiveRoute" />
    <app-container v-if="settingStore.isInit" />
  </q-layout>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useSettingStore } from '@/stores/setting'

import { AppContainer, AppHeader, AppSide } from '@/components/app'

import { useAppInitialization } from '@/composition/app/useAppInitialization'

const quasar = useQuasar()
const route = useRoute()
const settingStore = useSettingStore()
const isImmersiveRoute = computed(() => route.meta.immersive === true)

useAppInitialization()
</script>
