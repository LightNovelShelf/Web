<template>
  <q-page padding>
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
                      <span>{{ book.Likes }}</span>
                    </div>
                    <q-space />
                    <div class="row flex-align-center q-gutter-xs">
                      <q-icon size="24px" :name="icon.mdiEye" />
                      <span>{{ book.Views }}</span>
                    </div>
                  </div>
                </div>
                <template v-if="book.Placeholder && generalSetting.enableBlurHash" v-slot:loading>
                  <blur-hash :blurhash="book.Placeholder" />
                </template>
              </q-img>
              <q-responsive v-else :ratio="2 / 3">
                <q-skeleton class="fit" square />
              </q-responsive>
            </q-card>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1">
            <div v-if="isActive">
              <div class="row flex-align-center">
                <div class="introduction" style="margin: 24px 0">书籍信息</div>

                <q-space />

                <div>
                  <q-avatar>
                    <img :src="book.User.Avatar" alt="book_user" />
                  </q-avatar>

                  <!-- TODO 这个组件点击的行为非常奇怪 -->
                  <q-menu :offset="[-30, 5]" anchor="bottom left" self="top right">
                    <q-card>
                      <q-card-section> {{ book.User.UserName }} </q-card-section>
                    </q-card>
                  </q-menu>
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold">《{{ book['Title'] }}》</div>
              <div style="margin-top: 24px">作者：{{ book['Author'] }}</div>
              <div>最后更新：{{ book['LastUpdate'] }}</div>
              <div>更新时间：{{ dateFormat(book['LastUpdateTime']) }} ({{ LastUpdateTimeDesc }})</div>
              <div>上次阅读：{{ lastReadTitle }}</div>
              <div style="margin-top: 24px">
                <div>简介</div>
                <div class="introduction" v-html="sanitizerHtml(book['Introduction'])"></div>
              </div>
              <div style="margin-top: 24px"></div>

              <div class="row q-gutter-md" v-if="isActive">
                <add-to-shelf :book="bookInList" />
                <q-btn color="primary" @click="startRead">继续阅读</q-btn>
                <q-btn v-if="book.CanEdit" color="red" :to="{ name: 'EditBook', param: { bid: bid } }">快速编辑</q-btn>
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
              <div>
                <div class="row q-gutter-x-md">
                  <q-skeleton type="QBtn" />
                  <q-skeleton type="QBtn" />
                </div>
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
    <comment style="margin-top: 12px" :type="CommentType.Book" :id="_bid" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, onActivated, toRaw } from 'vue'
import sanitizerHtml from 'src/utils/sanitizeHtml'
import { useRouter } from 'vue-router'
import { Comment } from 'src/components/'
import { getBookInfo } from 'src/services/book'
import { useToNow } from 'src/composition/useToNow'
import { QGrid, QGridItem } from 'src/components/grid'
import { loadHistory } from 'src/utils/biz/read'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import type { BookServicesTypes } from 'src/services/book'
import { useAppStore } from 'stores/app'
import { icon } from 'assets/icon'
import { getErrMsg } from 'src/utils/getErrMsg'
import { useQuasar } from 'quasar'
import AddToShelf from 'src/components/biz/MyShelf/AddToShelf.vue'
import { BookInList } from 'src/services/book/types'
import { DateTime } from 'luxon'
import { CommentType } from 'src/services/comment/types'
import { userReadPositionDB } from 'src/utils/storage/db'
import BlurHash from 'src/components/BlurHash.vue'
import { useSettingStore } from 'stores/setting'

const props = defineProps<{ bid: string }>()

const settingStore = useSettingStore()
const { generalSetting } = settingStore // 引入setting用于控制图片自定义占位符
const $q = useQuasar()
const router = useRouter()
const appStore = useAppStore()
let bookInfo = ref<BookServicesTypes.GetBookInfoRes>()
let _bid = computed(() => ~~(props.bid || '1'))
// 每次从服务器获取数据时，更新此字段，每次进入页面时，从缓存读取本数据
let position = ref(null)
const getInfo = useTimeoutFn(async () => {
  try {
    bookInfo.value = await getBookInfo(_bid.value)
    let temp = bookInfo.value.ReadPosition
    if (temp) {
      position.value = {
        cid: temp.Cid,
        xPath: temp.XPath
      }
      await userReadPositionDB.set(`${appStore.userId}_${_bid.value}`, toRaw(position.value))
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
  await router.push({ name: 'Read', params: { bid: _bid.value, sortNum: sortNum } })
}

// 只要数据中的id和props不同，就当在加载
const isActive = computed(() => book.value?.Id === _bid.value)
useInitRequest(getInfo, { isActive })

// 读取历史
onActivated(async () => {
  position.value = await loadHistory(appStore.userId, _bid.value)
})

const book = computed(() => bookInfo.value?.Book)
const bookInList = computed<BookInList | null>(() =>
  book.value
    ? ({
        ...toRaw(book.value),
        UserName: book.value?.User.UserName
      } as BookInList)
    : null
)
const LastUpdateTimeDesc = useToNow(computed(() => book.value?.LastUpdateTime))
const lastReadTitle = computed(() => {
  if (position && position.value?.cid) {
    let chap = bookInfo.value?.Book?.Chapter?.find((x) => x.Id === position.value.cid)
    return chap.Title
  }
  return '暂无'
})
function dateFormat(time: Date) {
  return DateTime.fromJSDate(time).toFormat('yyyy-MM-dd hh:mm')
}
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
