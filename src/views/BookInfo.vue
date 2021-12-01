<template>
  <div>
    <q-card>
      <q-card-section>
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
          <q-grid-item>
            <q-img v-if="isActive" :src="book.Cover" :ratio="2 / 3" />
            <q-responsive v-else :ratio="2 / 3">
              <q-skeleton class="fit" square />
            </q-responsive>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1">
            <div v-if="isActive">
              <n-h2 @click="getInfo">《{{ book['Title'] }}》</n-h2>
              <div>作者：{{ book['Author'] }}</div>
              <div>更新：{{ LastUpdateTimeDesc }}</div>
              <div style="margin-top: 24px">
                <div>简介</div>
                <div class="introduction" v-html="book['Introduction']"></div>
              </div>
              <div style="margin-top: 24px"></div>

              <n-space v-if="isActive">
                <q-btn>加入书架</q-btn>
                <q-btn>继续阅读</q-btn>
              </n-space>
            </div>
            <div v-else class="q-gutter-md">
              <q-skeleton />
              <q-skeleton width="50%" />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton height="150px" />
              <div></div>
              <n-space>
                <q-skeleton type="QBtn" />
                <q-skeleton type="QBtn" />
              </n-space>
            </div>
          </q-grid-item>
        </q-grid>

        <div style="text-align: center; margin-top: 24px">
          <div>
            <div v-for="(item, index) in book['Chapter']" :key="index">{{ item }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <comment style="margin-top: 24px" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onActivated } from 'vue'
import Comment from '@/components/Comment.vue'
import { getBookInfo } from '@/services/book'
import { useToNow } from '@/composition/useToNow'
import { QGrid, QGridItem } from '@/plugins/quasar/components'

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
    let book = ref<any>({})
    const getInfo = async () => {
      book.value = await getBookInfo(~~props.bid)
    }

    onActivated(getInfo)
    const LastUpdateTimeDesc = useToNow(computed(() => book.value.LastUpdateTime))

    return {
      isActive: computed(() => book.value.Id === ~~props.bid),
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
