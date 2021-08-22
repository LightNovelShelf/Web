<template>
  <el-container>
    <el-header style="text-align: left; display: flex">
      <div>轻书架</div>
    </el-header>

    <el-container>
      <el-aside>
        <el-menu default-active="2" class="el-menu-vertical-demo" collapse>
          <el-submenu index="1">
            <template #title>
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item-group>
              <template #title>分组一</template>
              <el-menu-item index="1-1">选项1</el-menu-item>
              <el-menu-item index="1-2">选项2</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
              <template #title>选项4</template>
              <el-menu-item index="1-4-1">选项1</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <template #title>导航二</template>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <template #title>导航三</template>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <template #title>导航四</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main>
        <div>内容</div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent } from 'vue'
import logo from '@/assets/img/logo.png'

export default defineComponent({
  name: 'Home',
  data() {
    return {
      logo
    }
  },
  mounted() {
    this.$message('aaa')
  }
})
</script>

<style lang="scss" scoped>
.el-aside {
  --el-aside-width: auto;
}
</style>
