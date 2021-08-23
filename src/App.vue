<template>
  <n-config-provider :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
    <router-view />
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createTheme, datePickerDark } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui'

export default defineComponent({
  setup() {
    return {
      darkTheme: createTheme([datePickerDark]),
      zhCN,
      dateZhCN
    }
  }
})
</script>

<style></style>
