<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <div v-if="isActive">
      <q-tab-panels v-model="tab">
        <q-tab-panel name="information">
          <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
            <q-grid-item>
              <div class="q-gutter-sm">
                <div class="text-opacity">封面预览</div>
                <q-card>
                  <q-img v-if="book?.Cover" :src="book['Cover']" :ratio="2 / 3">
                    <template v-if="book?.Placeholder && generalSetting.enableBlurHash" v-slot:loading>
                      <blur-hash :blurhash="book.Placeholder" />
                    </template>
                  </q-img>
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
                <html-editor v-model:html="book['Introduction']" mode="simple" @save="!getSaveState() && save()" />
                <q-select map-options emit-value v-model="book['CategoryId']" :options="options" label="分类" />
                </div>
                </q-grid-item>
                </q-grid>
                </q-tab-panel>
                <q-tab-panel name="setting">
                  <div class="q-gutter-md">
                    <div>
                      <div class="q-gutter-sm light-radio">
                        <div class="text-subtitle1">书籍等级</div>
                        <div class="q-px-md">
                          <q-slider v-model="bookSetting['Level']" marker-labels :min="0" :max="6" />
                        </div>
                      </div>
                    </div>
                    <div v-if="appStore.user.InteriorLevel > 0">
                      <div class="q-gutter-sm light-radio">
                        <div class="text-subtitle1">书籍内部等级</div>
                        <q-input v-model.number="bookSetting['InteriorLevel']" type="number" filled :rules="[
                                    (val) =>
                                      (val <= appStore.user.InteriorLevel && val >= 0) ||
                                      `输入的等级需大于0且小于${appStore.user.InteriorLevel}`
                                  ]" style="max-width: 200px">
                          <template v-slot:append>
                            <q-icon :name="icon.mdiClose" @click="bookSetting['InteriorLevel'] = 0" class="cursor-pointer" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
                <q-tab-panel name="chapter">
                  <div class="q-gutter-sm">
                    <q-input label="标题" v-model="chapter['Title']" />
                    <div class="text-opacity">内容</div>
                    <html-editor v-model:html="chapter['Content']" mode="common" @save="!getSaveState() && save()" />
                  </div>
                </q-tab-panel>
                <q-tab-panel name="new">
                  <div class="q-gutter-sm">
                    <q-input label="标题" v-model="creatingChapterContent.title" />
                    <div class="text-opacity">内容</div>
                    <html-editor v-model:html="creatingChapterContent.html" mode="common" @save="!getSaveState() && save()" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
      <q-inner-loading
        :showing="!chapterLoaded"
        label="加载中..."
        label-class="text-teal"
        label-style="font-size: 1.1em"
      />
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
      <q-item clickable v-ripple :active="tab === 'information'" @click="tab = 'information'">
        <q-item-section> 信息 </q-item-section>
      </q-item>
      <q-item clickable v-ripple :active="tab === 'setting'" @click="tab = 'setting'">
        <q-item-section> 设置 </q-item-section>
      </q-item>
      <q-separator class="q-my-sm" />
      <Draggable
        v-model="chapters"
        :animation="100"
        item-key="Id"
        class="list-group"
        ghost-class="ghost"
        @change="handleChange"
      >
        <template #item="{ element, index }">
          <q-item
            clickable
            v-ripple
            @click="
              () => {
                _cid = element.Id
                tab = 'chapter'
              }
            "
            :active="tab === 'chapter' && _cid === element.Id"
            :disable="disableDrawer"
          >
            <q-item-section>{{ element.Title }}</q-item-section>
            <q-item-section side>
              <q-btn flat round @click.stop="delChapter(index + 1)" :icon="icon.mdiDelete"></q-btn>
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
import { BookServicesTypes, editBook, getBookEditInfo, getBookSetting, setBookSetting } from 'src/services/book'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useQuasar } from 'quasar'
import { BlurHash, HtmlEditor } from 'src/components'
import { getErrMsg } from 'src/utils/getErrMsg'
import Draggable from 'vuedraggable'
import { useAppStore } from 'stores/app'
import {
  changeChapterSort,
  createNewChapter,
  deleteChapter,
  editChapterContent,
  getChapterEditInfo
} from 'src/services/chapter'
import { useSettingStore } from 'stores/setting'

const settingStore = useSettingStore()
const { generalSetting } = settingStore

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
let _bid = computed(() => ~~(props.bookId || '1'))
let _cid = ref(-1)
let chapter = ref<any>({ Title: '加载中...', Content: '加载中...' })
let chapterLoaded = ref(true)
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

interface BookSetting {
  Level?: number
  InteriorLevel?: number
}

watch(
  () => _cid.value,
  async () => {
    chapterLoaded.value = false
    if (_cid.value <= 0) {
      chapterLoaded.value = true
      return
    }
    chapter.value = { Title: '加载中...', Content: '加载中...' }
    chapter.value = await getChapterEditInfo({ BookId: _bid.value, Cid: _cid.value })
    chapterLoaded.value = true
  }
)

function getSaveState(): boolean {
  if (isActive.value && !draggingFab.value) {
    return !(tab.value !== 'chapter' || chapterLoaded.value)
  }
  return true
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

//#region book

async function save() {
  switch (tab.value) {
    case 'new':
      await createChapter()
      break
    case 'information':
      await saveInfo()
      break
    case 'setting':
      await saveSetting()
      break
    case 'chapter':
      await saveChapter()
      break
  }
}

async function saveSetting() {
  try {
    await setBookSetting({ Bid: _bid.value, Settings: toRaw(bookSetting) })
    $q.notify({
      type: 'positive',
      message: '设置成功'
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }
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
      return
    }

    chapters.value = chapters.value.map((c) => {
      if (c.Id == _cid.value) {
        return { Id: c.Id, Title: chapter.value.Title } as ChapterInfo
      }

      return c
    })
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
    creatingChapterContent.sortNum = data
    tab.value = 'new'
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
      if (chapters.value[sortNum - 1].Id === _cid.value) tab.value = 'information'
      chapters.value = resp
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
    let emptyHtml = !creatingChapterContent.html
    let emptyTitle = !creatingChapterContent.title

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
      const { Chapters: resp, NewCid: cid } = <any>await createNewChapter({
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
      creatingChapterContent.title = ''
      creatingChapterContent.html = ''
      creatingChapterContent.sortNum = ''
      tab.value = 'chapter'
      _cid.value = cid
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
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })

    const tempValue = chapters.value[newIndex]
    chapters.value.splice(newIndex, 1)
    chapters.value.splice(oldIndex - 1 >= 0 ? oldIndex : 0, 0, tempValue)
  }
  disableDrawer.value = false
}

const request = useTimeoutFn(async () => {
  let p1 = getBookEditInfo(_bid.value).then((data: any) => {
    bookInfo.value = data
    options.value = data.Categories.map((item) => {
      return {
        label: item.Name,
        value: item.Id
      }
    })
    chapters.value = <ChapterInfo[]>data.Book.Chapters
    book.value = data.Book
  })
  let p2 = getBookSetting(_bid.value).then((setting: Record<string, any>) => {
    bookSetting.Level = setting.Level
    bookSetting.InteriorLevel = setting.InteriorLevel
  })
  await Promise.all([p1, p2])
})

const refresh = () => {
  // refresh page data when back to another book.
  chapter.value = { Title: '加载中...', Content: '加载中...' }
  tab.value = 'information'
  creatingChapterContent.title = ''
  creatingChapterContent.html = ''
  creatingChapterContent.sortNum = ''
}
useInitRequest(request, { before: refresh, isActive })
</script>

<style lang="scss" scoped></style>
