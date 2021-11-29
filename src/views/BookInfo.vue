<template>
  <div style="max-width: 80vw" class="mx-auto">
    <n-card>
      <n-grid x-gap="24" y-gap="6" cols="1 600:2">
        <n-grid-item>
          <q-img :src="book.Cover" :ratio="2 / 3" />
        </n-grid-item>
        <n-grid-item>
          <n-h2 @click="getInfo">《{{ book['Title'] }}》</n-h2>
          <div>作者：{{ book['Author'] }}</div>
          <!-- <div>更新：{{ lastUpdateTime }}</div> -->
          <div>更新：{{ book.LastUpdateTimeDesc }}</div>
          <div style="margin-top: 24px">
            <div>简介</div>
            <div class="introduction" v-html="book['Introduction']"></div>
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
        <div v-for="(item, index) in book['Chapter']" :key="index">{{ item }}</div>
      </div>
    </n-card>
    <comment style="margin-top: 24px" />
    <n-back-top />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Comment from '@/components/Comment.vue'
import { useTickSource } from '@/composition/useTickSource'
import { toNow } from '@/utils/time'
import { getBookInfo } from '@/services/book'

export default defineComponent({
  name: 'BookInfo',
  components: {
    Comment
  },
  props: {
    bid: String
  },
  setup(props) {
    let book = ref<any>({})
    const getInfo = async () => {
      book.value = await getBookInfo(~~props.bid)

      // 这个键值是用来存放格式化文案
      book.value.LastUpdateTimeDesc = ''
    }

    onMounted(getInfo)

    // 2. 适合批量更新的，好处是不用额外导出变量，坏处是import的东西变多了，需要自己手动格式化
    useTickSource(() => {
      if (book.value.LastUpdateTime) {
        book.value.LastUpdateTimeDesc = toNow(book.value.LastUpdateTime)
      }
    })

    return {
      book,
      getInfo
    }
  }
})
</script>

<style scoped lang="scss">
.introduction {
  opacity: 0.6;
  line-height: 1;
  padding-top: 6px;
  :deep(p) {
    margin: 0;
  }
}
</style>
