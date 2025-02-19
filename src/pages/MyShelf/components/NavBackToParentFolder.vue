<!-- 返回顶层文件夹 -->
<!-- 按照之前的设计，返回文件夹是使用router.push实现的，这里暂且保留这个设定；因为计划要实现多层文件夹，所以这个组件专门声明为root -->
<template>
  <a href="#" @click="navHandle">
    <div class="book-cover">
      <q-card>
        <q-responsive :ratio="2 / 3">
          <q-icon size="80px" color="grey">
            <i-mdi-reply />
          </q-icon>
        </q-responsive>
      </q-card>
    </div>
  </a>
</template>

<script lang="ts" setup>
import type { StateEntry } from 'vue-router'

const router = useRouter()

/** 断言输入变量是vue-router写入的state */
function assertStateIsVueState(input: unknown): asserts input is StateEntry {
  if (
    input &&
    typeof input === 'object' &&
    'back' in input &&
    'current' in input &&
    'forward' in input &&
    'position' in input &&
    'replaced' in input &&
    'scroll' in input
  ) {
    return
  }

  throw new Error('')
}

/** 从state信息中判断back路径是否是书架路径 */
function canNavBackToParent(history: History): boolean {
  try {
    const state = history.state
    assertStateIsVueState(state)
    const shelfRouteInfo = router.resolve({ name: 'MyShelf' })
    /**
     * back current是 currentLocation.value 也就是 fullPath
     * // buildState入参
     * @link https://github.com/vuejs/router/blob/v4.0.15/src/history/html5.ts#L287
     * // currentLocation 被 changeLocation 消费的入口
     * @link https://github.com/vuejs/router/blob/v4.0.15/src/history/html5.ts#L203
     */
    return state.back && state.back.includes(shelfRouteInfo.fullPath)
  } catch (e) {
    return false
  }
}

/** 点击回调 */
function navHandle(evt: MouseEvent) {
  evt.preventDefault()

  if (canNavBackToParent(window.history)) {
    router.go(-1)
  } else {
    router.push({ name: 'MyShelf' })
  }
}
</script>

<style lang="scss" scoped>
.book-cover {
  position: relative;
  box-sizing: border-box;
}
</style>
