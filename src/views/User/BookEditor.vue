<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <div v-if="isActive">
      <div v-if="currentChapter === -1 && !creatingChapter">
        <q-tab-panels v-model="tab" animated transition-prev="jump-up" transition-next="jump-down">
          <q-tab-panel name="information">
            <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2" class="q-pa-sm">
              <q-grid-item>
                <div class="q-gutter-sm">
                  <div class="text-opacity">封面预览</div>
                  <q-card>
                    <q-img v-if="book?.Cover" :src="book['Cover']" :ratio="2 / 3" />
                    <q-responsive v-else :ratio="2 / 3">
                      <q-skeleton class="fit" square />
                    </q-responsive>
                  </q-card>
                </div>
              </q-grid-item>
              <q-grid-item span="2" xs="1" sm="1" md="1">
                <div class="q-gutter-sm">
                  <q-input label="封面地址" placeholder="https://" v-model="book['Cover']" />
                  <q-input label="书名" v-model="book['Title']" />
                  <q-input label="作者" v-model="book['Author']" />
                  <div class="text-opacity">简介</div>
                  <html-editor v-model:html="book['Introduction']" mode="simple" />
                  <q-select map-options emit-value v-model="book['CategoryId']" :options="options" label="分类" />
                </div>
              </q-grid-item>
            </q-grid>
          </q-tab-panel>
          <q-tab-panel name="setting">
            <div class="q-pa-md">
              <div class="q-gutter-xs light-radio q-mt-md q-pb-md q-px-sm">
                <div class="text-subtitle1">书籍等级</div>
                <q-slider v-model="bookSetting['Level']" marker-labels :min="0" :max="6" />
              </div>
              <div class="q-gutter-xs light-radio q-mt-md q-pb-md q-px-sm" v-if="appStore.user.InteriorLevel > 0">
                <div class="text-subtitle1">书籍内部等级</div>
                <q-input
                  v-model.number="bookSetting['InteriorLevel']"
                  type="number"
                  filled
                  :rules="[
                    (val) =>
                      (val <= appStore.user.InteriorLevel && val >= 0) ||
                      `输入的等级需大于0且小于${appStore.user.InteriorLevel}`
                  ]"
                  style="max-width: 200px;"
                >
                  <template v-slot:append>
                    <q-icon :name="icon.mdiClose" @click="bookSetting['InteriorLevel'] = 0" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <div v-else-if="creatingChapter" class="q-gutter-sm">
        <q-btn :icon="icon.mdiClose" @click.prevent="creatingChapter = false">关闭</q-btn>
        <q-input label="标题" v-model="creatingChapterContent.title" />
        <div class="text-opacity">内容</div>
        <html-editor v-model:html="creatingChapterContent.html" mode="common" />
      </div>

      <div v-else>
        <div class="q-gutter-sm">
          <q-input label="标题" v-model="chapter['Title']" />
          <div class="text-opacity">内容</div>
          <html-editor v-model:html="chapter['Content']" mode="common" />
        </div>
        <q-inner-loading
          :showing="!chapterLoaded"
          label="加载中..."
          label-class="text-teal"
          label-style="font-size: 1.1em"
        />
      </div>
    </div>
    <div v-else class="absolute-full">
      <q-inner-loading :showing="!isActive" label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>
    <q-page-sticky position="top-right" :offset="[18, 18]" v-if="!siderShow">
      <q-btn fab :icon="icon.mdiArrowLeft" color="accent" @click="show = !show" />
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-btn
        fab
        :icon="icon.mdiContentSave"
        color="secondary"
        :disable="getSaveState()"
        v-touch-pan.prevent.mouse="moveFab"
        @click="save()"
      ></q-btn>
    </q-page-sticky>
  </q-page>
  <q-drawer
    v-if="route.name === 'UserBookEditor'"
    v-model="show"
    side="right"
    bordered
    :width="240"
    :breakpoint="siderBreakpoint"
  >
    <q-scroll-area class="fit">
      <q-item
        clickable
        v-ripple
        :active="currentChapter === -1 && tab === 'information'"
        @click="
          () => {
            currentChapter = -1
            tab = 'information'
          }
        "
      >
        <q-item-section> 信息 </q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        :active="currentChapter === -1 && tab === 'setting'"
        @click="
          () => {
            currentChapter = -1
            tab = 'setting'
          }
        "
      >
        <q-item-section> 设置 </q-item-section>
      </q-item>
      <q-separator class="q-my-sm" />
      <Draggable
        v-model="showChapters"
        :animation="100"
        item-key="Id"
        class="list-group"
        ghost-class="ghost"
        @change="handleChange"
      >
        <template #item="{ element }">
          <q-item
            clickable
            v-ripple
            @click="currentChapter = element.Sort + 1"
            :active="currentChapter - 1 === element.Sort"
            :disable="disableDrawer"
          >
            <q-item-section>{{ element.Title }}</q-item-section>
            <q-item-section side>
              <q-btn flat round @click.prevent="delChapter(element.Sort + 1)" :icon="icon.mdiDelete"></q-btn>
            </q-item-section>
          </q-item>
        </template>
      </Draggable>
      <q-separator class="q-my-sm" />
      <q-item>
        <q-item-section>
          <q-btn color="secondary" @click.prevent="addChapter()" :disable="getSaveState()"> 新增 </q-btn>
        </q-item-section>
      </q-item>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { useLayout } from 'src/components/app/useLayout'
import { QGrid, QGridItem } from 'src/components/grid'
import { icon } from 'assets/icon'
import { BookServicesTypes, editBook, getBookEditInfo } from 'src/services/book'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useQuasar } from 'quasar'
import { HtmlEditor } from 'src/components'
import { getErrMsg } from 'src/utils/getErrMsg'
import Draggable from 'vuedraggable'
import { setBookSetting, getBookSetting } from '../../services/book/index'
import { useAppStore } from '../../stores/app'
import {
  createNewChapter,
  deleteChapter,
  changeChapterSort,
  editChapterContent,
  getChapterEditInfo
} from 'src/services/chapter'

const layout = useLayout()
const { siderShow, siderBreakpoint } = layout
const props = defineProps<{ bookId: string }>()
const $q = useQuasar()
const route = useRoute()
const appStore = useAppStore()

//#region refs

let show = ref(false)
show.value = siderShow.value

let options = ref([])
// 只要数据中的id和props不同，就当在加载
let isActive = computed(() => book.value?.Id === _bid.value)
let disableDrawer = ref(false)
let fabPos = ref([18, 18])
let draggingFab = ref(false)
let book = ref<any>()
let bookInfo = ref<BookServicesTypes.GetBookInfoRes>()
let chapters = ref([] as ChapterInfo[])
let showChapters = ref([] as ShowChapterInfo[])
let _bid = computed(() => ~~(props.bookId || '1'))
// currentChapter is the index of selected element. *NOT* Id.
let currentChapter = ref(-1)
let _cid = computed(() => {
  if (currentChapter.value <= 0) {
    currentChapter.value
    return
  }
  return chapters.value[currentChapter.value - 1].Id
})
let chapter = ref<any>({ Title: '加载中...', Content: '加载中...' })
let chapterLoaded = ref(true)
let creatingChapter = ref(false)
let creatingChapterContent = reactive({
  sortNum: '',
  title: '',
  html: ''
})
let tab = ref('information')
let bookSetting = reactive({} as BookSetting)
//#endregion

interface ChapterInfo {
  Id?: number
  Title?: string
}

interface ShowChapterInfo extends ChapterInfo {
  Sort: number
}

interface BookSetting {
  Level?: number
  InteriorLevel?: number
}

watch(_cid, async () => {
  chapterLoaded.value = false
  if (_cid.value <= 0) return
  chapter.value = { Title: '加载中...', Content: '加载中...' }
  chapter.value = await getChapterEditInfo({ BookId: _bid.value, Cid: _cid.value })
  chapterLoaded.value = true
})

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

//#region book

function getSaveState(): boolean {
  if (isActive.value && !draggingFab.value) {
    return !(currentChapter.value === -1 || chapterLoaded.value)
  }
  return true
}

async function save() {
  if (creatingChapter.value) {
    await createChapter()
    return
  }
  if (currentChapter.value === -1) {
    if (tab.value === 'information') {
      await saveInfo()
      return
    }
    if (tab.value === 'setting') {
      await saveSetting()
      return
    }
  } else {
    await saveChapter()
    return
  }
}

async function saveSetting() {
  await setBookSetting({ Bid: _bid.value, Settings: toRaw(bookSetting) })
}

async function saveInfo() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await editBook(toRaw(book.value))

      $q.notify({
        type: 'positive',
        message: '修改成功'
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  })
}

async function saveChapter() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await editChapterContent(toRaw(chapter.value))

      $q.notify({
        type: 'positive',
        message: '修改成功'
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  })
}

async function addChapter() {
  $q.dialog({
    title: '章节顺序',
    cancel: true,
    persistent: true,
    prompt: {
      label: '从1开始，0在最后（留空则在最后插入）',
      model: '',
      type: 'number'
    }
  }).onOk((data) => {
    creatingChapter.value = true
    creatingChapterContent.sortNum = data
  })
}

async function delChapter(sortNum: number) {
  $q.dialog({
    title: '提示',
    message: '该章节将被永久删除！',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const resp: ChapterInfo[] = <any>await deleteChapter({ BookId: _bid.value, SortNum: sortNum })
      chapters.value = resp
      showChapters.value = chapters.value.map((v, i) => {
        return {
          Id: v.Id,
          Title: v.Title,
          Sort: i
        }
      })
      currentChapter.value -= 1
      if (currentChapter.value === 0) {
        currentChapter.value = -1
      }
      $q.notify({
        type: 'positive',
        message: '删除成功'
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  })
}

async function createChapter() {
  try {
    let sort = ~~creatingChapterContent.sortNum
    let emptyHtml = creatingChapterContent.html === ''
    let emptyTitle = creatingChapterContent.title === ''

    if (emptyHtml || emptyTitle) {
      $q.dialog({
        title: '警告',
        message: `你的标题或内容为空，将使用默认值初始化：${emptyTitle && '<br/>章节名：新章节'}${
          emptyHtml && '<br/>内容：轻书架'
        }`,
        html: true,
        persistent: true,
        cancel: true
      }).onOk(async () => {
        creatingChapterContent.html = '轻书架'
        creatingChapterContent.title = '新章节'
        await inner()
      })
    } else {
      await inner()
    }

    async function inner() {
      const resp: ChapterInfo[] = <any>await createNewChapter({
        BookId: _bid.value,
        SortNum: sort,
        Content: creatingChapterContent.html,
        Title: creatingChapterContent.title
      })
      $q.notify({
        type: 'positive',
        message: '新增成功'
      })
      chapters.value = resp
      showChapters.value = chapters.value.map((v, i) => {
        return {
          Id: v.Id,
          Title: v.Title,
          Sort: i
        }
      })
      creatingChapter.value = false
      creatingChapterContent.title = ''
      creatingChapterContent.html = ''
      creatingChapterContent.sortNum = ''
    }
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }
}

//#endregion

async function handleChange(evt) {
  disableDrawer.value = true
  const moved = evt.moved
  const { oldIndex, newIndex } = moved
  let oldSort = oldIndex + 1
  let newSort = newIndex + 1

  try {
    const changedList = await changeChapterSort({ BookId: _bid.value, OldSortNum: oldSort, NewSortNum: newSort })
    chapters.value = <ChapterInfo[]>changedList
    showChapters.value = chapters.value.map((v, i) => {
      return {
        Id: v.Id,
        Title: v.Title,
        Sort: i
      }
    })
    currentChapter.value = newSort
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })

    // exchange index
    let old = chapters.value[oldIndex]
    chapters.value[oldIndex] = chapters.value[newIndex]
    chapters.value[newIndex] = old

    showChapters.value = chapters.value.map((v, i) => {
      return {
        Id: v.Id,
        Title: v.Title,
        Sort: i
      }
    })
  }
  disableDrawer.value = false
}

const request = useTimeoutFn(async () => {
  // fucking AnyScript
  const data = (await getBookEditInfo(_bid.value)) as any
  bookInfo.value = data
  options.value = data.Categories.map((item) => {
    return {
      label: item.Name,
      value: item.Id
    }
  })
  chapters.value = <ChapterInfo[]>data.Book.Chapters
  showChapters.value = chapters.value.map((v, i) => {
    return {
      Id: v.Id,
      Title: v.Title,
      Sort: i
    }
  })
  book.value = data.Book
  const setting = (await getBookSetting(_bid.value)) as Record<string, any>
  bookSetting.Level = setting.Level
  bookSetting.InteriorLevel = setting.InteriorLevel
})

const refresh = () => {
  // refresh page data when back to another book.
  chapterLoaded.value = false
  chapter.value = { Title: '加载中...', Content: '加载中...' }
  if (currentChapter.value !== -1) {
    if (chapters.value.length >= currentChapter.value) {
      getChapterEditInfo({ BookId: _bid.value, SortNum: currentChapter.value })
        .then((value) => {
          chapter.value = value
          chapterLoaded.value = true
        })
        .catch((e) => {
          $q.notify({
            type: 'negative',
            message: getErrMsg(e)
          })
        })
    } else {
      // if cannot back to the same chapter in previous book, change to information page.
      currentChapter.value = -1
    }
  }
  creatingChapterContent.title = ''
  creatingChapterContent.html = ''
  creatingChapterContent.sortNum = ''
}
useInitRequest(request, { after: refresh, isActive })
</script>

<style lang="scss" scoped></style>
