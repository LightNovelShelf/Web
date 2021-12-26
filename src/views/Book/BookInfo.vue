<template>
  <div>
    <q-card>
      <q-card-section>
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
          <q-grid-item>
            <q-card>
              <q-img v-if="isActive" :src="book.Cover" :ratio="2 / 3">
                <div class="absolute-bottom bottom-shadow">
                  <div class="row">
                    <div class="row flex-align-center q-gutter-xs">
                      <q-icon size="24px" :name="icon.mdiHeart" />
                      <span>{{ book.Subscription }}</span>
                    </div>
                    <q-space />
                    <div class="row flex-align-center q-gutter-xs">
                      <q-icon size="24px" :name="icon.mdiEye" />
                      <span>{{ book.Views }}</span>
                    </div>
                  </div>
                </div>
              </q-img>
              <q-responsive v-else :ratio="2 / 3">
                <q-skeleton class="fit" square />
              </q-responsive>
            </q-card>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1" style="position: relative">
            <div v-if="isActive">
              <div class="absolute-top-right">
                <div style="padding: 12px 0 0 0">
                  <q-avatar>
                    <img :src="book.User.Avatar" alt="book_user" />
                  </q-avatar>

                  <!-- TODO 这个组件点击的行为非常奇怪 -->
                  <q-menu :offset="[-30, 5]" anchor="bottom left" self="top right">
                    <q-card>
                      <q-card-section> 这里放上传者的信息 </q-card-section>
                    </q-card>
                  </q-menu>
                </div>
              </div>
              <div class="introduction" style="margin: 24px 0">书籍信息</div>
              <div class="text-subtitle1 text-weight-bold" style="margin-bottom: 24px">《{{ book['Title'] }}》</div>
              <div>作者：{{ book['Author'] }}</div>
              <div>最后更新：{{ book['LastUpdate'] }} ({{ LastUpdateTimeDesc }})</div>
              <div>上次阅读：{{ lastReadTitle }}</div>
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

        <q-list v-if="isActive" separator style="margin-top: 12px">
          <q-item
            v-for="(item, index) in book?.Chapter"
            :key="item.Id"
            :to="{ name: 'Read', params: { bid: bid, sortNum: index + 1 } }"
            clickable
            v-ripple
          >
            <q-item-section>{{ item.Title }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <comment style="margin-top: 12px" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, ref, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import Comment from '@/components/Comment.vue'
import { getBookInfo } from '@/services/book'
import { useToNow } from '@/composition/useToNow'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import { loadHistory } from '@/utils/biz/read'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import type { BookServicesTypes } from '@/services/book'
import { useAppStore } from '@/store'
import { icon } from '@/plugins/icon'
import { getErrMsg } from '@/utils/getErrMsg'
import { useQuasar } from 'quasar'

defineComponent({ QGrid, QGridItem, Comment })
const props = defineProps<{ bid: string }>()

const $q = useQuasar()
const router = useRouter()
const appStore = useAppStore()
let bookInfo = ref<BookServicesTypes.GetBookInfoRes>()
let bid = computed(() => ~~(props.bid || '1'))
// 每次从服务器获取数据时，更新此字段，每次进入页面时，从缓存读取本数据
let position = ref(null)
const getInfo = useTimeoutFn(async () => {
  try {
    bookInfo.value = await getBookInfo(bid.value)
    let temp = bookInfo.value.ReadPosition
    if (temp) {
      position.value = {
        cid: temp.Cid,
        xPath: temp.XPath
      }
    }
  } catch (error) {
    $q.notify({
      message: getErrMsg(error),
      color: 'negative',
      timeout: 1500
    })
  }
})
const startRead = async () => {
  let sortNum = 1
  // 将章节id转换为sortNum
  if (position.value?.xPath) {
    sortNum = bookInfo.value.Book.Chapter.findIndex((x) => x.Id === position.value.cid) + 1
  }
  await router.push({ name: 'Read', params: { bid: bid.value, sortNum: sortNum } })
}

useInitRequest(getInfo)
onActivated(async () => {
  position.value = await loadHistory(appStore.userId, bid.value)
})

// 只要数据中的id和props不同，就当在加载
const book = computed(() => bookInfo.value?.Book)
const isActive = computed(() => book.value?.Id === bid.value)
const LastUpdateTimeDesc = useToNow(computed(() => book.value?.LastUpdateTime))
const lastReadTitle = computed(() => {
  if (position && position.value?.cid) {
    let chap = bookInfo.value?.Book?.Chapter?.find((x) => x.Id === position.value.cid)
    return chap.Title
  }
  return '暂无'
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

.bottom-shadow {
  background-color: unset;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 1), transparent);
}

a {
  color: unset;
  text-decoration: unset;
}
</style>
