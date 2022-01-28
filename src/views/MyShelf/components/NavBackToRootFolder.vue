<!-- 返回顶层文件夹 -->
<!-- 按照之前的设计，返回文件夹是使用router.push实现的，这里暂且保留这个设定；因为计划要实现多层文件夹，所以这个组件专门声明为root -->
<template>
  <router-link :to="{ name: 'MyShelf' }">
    <div class="book-cover">
      <q-card>
        <q-responsive :ratio="2 / 3">
          <q-icon size="80px" color="grey" :name="mdiReply" />
        </q-responsive>
      </q-card>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { mdiReply } from '@/plugins/icon/export'
</script>

<style lang="scss" scoped>
.book-cover {
  position: relative;
  box-sizing: border-box;
}
</style>
