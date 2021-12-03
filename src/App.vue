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
import { useQuasar } from 'quasar'
import { useServerNotify } from '@/services/utils/useServerNotify'
import sanitizerHtml from '@/utils/sanitizeHtml'

export default defineComponent({
  components: {
    AppSider,
    AppHeader,
    AppContainer
  },
  setup() {
    const $q = useQuasar()
    $q.loadingBar.setDefaults({
      color: 'purple',
      size: '2px',
      position: 'top'
    })

    useServerNotify('OnMessage', (message: string) => {
      $q.notify({
        position: 'top',
        html: true,
        message: sanitizerHtml(message),
        timeout: 2500
      })
    })

    return {}
  }
})
</script>

<style lang="scss" scoped></style>
