<template>
  <n-layout class="home">
    <n-layout-header class="header" bordered>
      <img class="header-img" :src="img.logo" />
      <div style="flex: 1"></div>
      <n-space vertical size='small' style='text-align: center;'>
        <img class="header-user" :src="img.user" />
        <span>QC Rapport</span>
      </n-space>
    </n-layout-header>
    <n-layout class="content-wrapper" has-sider>
      <n-layout-sider content-style="padding: 24px;" :native-scrollbar="false" bordered>
        <n-h2>海淀桥</n-h2>
        <n-h2>海淀桥</n-h2>
        <n-h2>海淀桥</n-h2>
      </n-layout-sider>
      <n-layout content-style="padding: 24px;" :native-scrollbar="false">
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<script>
import { defineComponent } from 'vue'
import logo from '@/assets/img/logo.png'
import user from '@/assets/img/user.png'

export default defineComponent({
  name: 'Home',
  data() {
    return {
      img: {
        logo,
        user
      }
    }
  },
  mounted() {
    // this.$message('aaa')
  }
})
</script>

<style lang="scss" scoped>
.home {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1;
  --header-height: 72px;

  .header {
    display: flex;
    align-items: center;
    height: var(--header-height);
    padding:0 24px;

    .header-img {
      max-height: var(--header-height);
    }

    .header-user {
    }
  }

  .content-wrapper {
    position: absolute;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
