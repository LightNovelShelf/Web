<template>
  <div>
    <q-card>
      <q-card-section>
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
          <q-grid-item>
            <q-img v-if="isActive" :src="book.Cover" :ratio="2 / 3"></q-img>
            <q-responsive v-else :ratio="2 / 3">
              <q-skeleton class="fit" square />
            </q-responsive>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1">
            <div v-if="isActive">
              <div class="introduction" style="margin: 24px 0">书籍信息</div>
              <div class="text-subtitle1 text-weight-bold" style="margin-bottom: 24px">《{{ book['Title'] }}》</div>
              <div>作者：{{ book['Author'] }}</div>
              <div>最后更新：{{ book['LastUpdate'] }} ({{ LastUpdateTimeDesc }})</div>
              <div style="margin-top: 24px">
                <div>简介</div>
                <div class="introduction" v-html="book['Introduction']"></div>
              </div>
              <div style="margin-top: 24px"></div>

              <div class="row q-gutter-md" v-if="isActive">
                <q-btn>加入书架</q-btn>
                <q-btn @click="startRead">继续阅读</q-btn>
              </div>
            </div>
            <div v-else class="q-gutter-md">
              <q-skeleton />
              <q-skeleton width="50%" />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton height="150px" />
              <div></div>
              <div class="row q-gutter-md">
                <q-skeleton type="QBtn" />
                <q-skeleton type="QBtn" />
              </div>
            </div>
          </q-grid-item>
        </q-grid>

        <q-list separator style="margin-top: 12px">
          <q-item
            v-for="(item, index) in book?.Chapter"
            :key="index"
            :to="{ name: 'Read', params: { bid: bid, sortNum: index + 1 } }"
            clickable
            v-ripple
          >
            <q-item-section>{{ item }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <comment style="margin-top: 12px" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onActivated, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Comment from '@/components/Comment.vue'
import { getBookInfo } from '@/services/book'
import { useToNow } from '@/composition/useToNow'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import { loadHistory } from '@/utils/read'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import type { BookServicesTypes } from '@/services/book'

export default defineComponent({
  name: 'BookInfo',
  components: {
    QGrid,
    QGridItem,
    Comment
  },
  props: {
    bid: String
  },
  setup(props) {
    const router = useRouter()
    let book = ref<BookServicesTypes.GetBookInfoRes>()
    let bid = computed(() => ~~(props.bid || '1'))
    const getInfo = useTimeoutFn(async () => {
      book.value = await getBookInfo(bid.value)
    })
    const startRead = async () => {
      let history = await loadHistory(0, bid.value)
      router.push({ name: 'Read', params: { bid: bid.value, sortNum: history?.Id ?? 1 } })
    }
    useInitRequest(getInfo)

    return {
      // 只要数据中的id和props不同，就当在加载
      isActive: computed(() => book.value?.Id === bid.value),
      book,
      getInfo,
      startRead,
      LastUpdateTimeDesc: useToNow(computed(() => book.value.LastUpdateTime))
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

a {
  color: unset;
  text-decoration: unset;
}
</style>
