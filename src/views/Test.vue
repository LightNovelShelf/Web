<template>
  <q-page padding>
    <q-list bordered separator class="rounded-borders title mx-auto">
      <q-item>
        <q-item-section class="text-h6">网站支持度测试</q-item-section>
      </q-item>
      <q-item v-for="(data, index) in option" :key="index">
        <q-item-section>
          <q-item-label class="text-subtitle1">{{ data.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>{{ data.func() }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
const option = [
  {
    name: 'line-break: anywhere',
    func: () => CSS.supports('line-break', 'anywhere')
  },
  {
    name: 'overflow: overlay',
    func: () => CSS.supports('overflow', 'overlay')
  },
  {
    name: '-webkit-line-clamp: number',
    func: () => CSS.supports('-webkit-line-clamp', '2')
  },
  {
    name: 'WebAssembly',
    func: () => !!WebAssembly
  },
  {
    name: 'Fetch',
    func: () => !!fetch
  },
  {
    name: 'Sanitizer',
    func: () => !!window.Sanitizer
  }
]
</script>

<style scoped lang="scss">
.title {
  max-width: 600px;
}
</style>
