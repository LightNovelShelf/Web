<template>
  <div>
    <q-card flat v-if="loading">
      <q-skeleton height="150px" square />

      <q-card-section>
        <q-skeleton type="text" class="text-subtitle1" />
        <q-skeleton type="text" width="50%" class="text-subtitle1" />
        <q-skeleton type="text" class="text-caption" />
      </q-card-section>
    </q-card>
    <div v-if="!loading">
      <n-card>
        <n-grid x-gap="24" y-gap="6" cols="1 600:2">
          <n-grid-item>
            <q-img :src="book.Cover" :ratio="2 / 3" />
          </n-grid-item>
          <n-grid-item>
            <n-h2 @click="getInfo">《{{ book['Title'] }}》</n-h2>
            <div>作者：{{ book['Author'] }}</div>
            <div>更新：{{ LastUpdateTimeDesc }}</div>
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
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, onActivated } from 'vue'
import Comment from '@/components/Comment.vue'
import { getBookInfo } from '@/services/book'
import { useToNow } from '@/composition/useToNow'

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
    const loading = ref(true)
    const getInfo = async () => {
      loading.value = true
      book.value = await getBookInfo(~~props.bid).finally(() => (loading.value = false))
    }

    onMounted(getInfo)
    onActivated(getInfo)
    const LastUpdateTimeDesc = useToNow(computed(() => book.value.LastUpdateTime))

    return {
      loading,
      book,
      getInfo,
      LastUpdateTimeDesc
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
