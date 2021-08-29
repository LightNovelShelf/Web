<template>
  <div style="max-width: 80vw" class="mx-auto">
    <n-card>
      <n-grid x-gap="24" y-gap="6" cols="1 600:2">
        <n-grid-item>
          <div
            :style="{
              paddingBottom: '150%',
              backgroundImage: `url('${book.cover}')`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }"
          >
          </div>
        </n-grid-item>
        <n-grid-item>
          <n-h2>《{{ book.title }}》</n-h2>
          <div>作者：xxx</div>
          <div>更新：xxx</div>
          <div style="margin-top: 24px">
            <div>简介</div><div style="opacity: 0.6">xxx<br />xxx</div>
          </div>
          <div style="margin-top: 24px"></div>
          <n-space>
            <n-button>聊天室</n-button>
            <n-button>加入书架</n-button>
            <n-button>分享</n-button>
            <n-button>阅读</n-button>
            <n-button>继续阅读(第x章)</n-button>
          </n-space>
          <n-space style="margin-top: 12px">
            <n-button>编辑</n-button>
          </n-space>
        </n-grid-item>
      </n-grid>

      <div style="text-align: center; margin-top: 24px">
        <div>第一章</div>
        <div>第一章</div>
        <div>第一章</div>
        <div>第一章</div>
        <div>第一章</div>
        <div>第一章</div>
        <div>第一章</div>
      </div>
    </n-card>
    <comment style="margin-top: 24px" />
    <n-back-top />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Comment from '@/components/Comment'

export default defineComponent({
  name: 'BookInfo',
  components: {
    Comment
  },
  data() {
    return {
      book: {
        title: '我是书名',
        cover: 'https://i0.hdslb.com/bfs/album/1cb53e28eb458d5e751ef48c6f5bfbae4a9b4f80.jpg'
      }
    }
  }
})
</script>

<style scoped lang="scss"></style>
