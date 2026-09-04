<template>
  <q-page style="max-width: 1920px" class="q-mx-auto">
    <div v-if="isActive">
      <q-tab-panels v-model="tab" class="book-editor-panels">
        <q-tab-panel name="information">
          <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
            <q-grid-item>
              <div class="book-editor-stack column gap-8">
                <div class="text-opacity">封面预览</div>
                <q-card>
                  <system-image v-if="book?.Cover" :url="book.Cover" :request-height="1024" :ratio="2 / 3" />
                  <q-responsive v-else :ratio="2 / 3">
                    <q-skeleton class="fit" square />
                  </q-responsive>
                </q-card>
              </div>
            </q-grid-item>
            <q-grid-item span="2" xs="1" sm="1" md="1">
              <div class="book-editor-stack column gap-8">
                <image-input v-model="book['Cover']" />
                <q-input :label="isComic ? '漫画名' : '书名'" v-model="book['Title']" />
                <q-input label="作者" v-model="book['Author']" />
                <div class="text-opacity">简介</div>
                <html-editor
                  :content="book['Introduction']"
                  @update:html="book['Introduction'] = $event"
                  mode="simple"
                />
                <q-select map-options emit-value v-model="book['CategoryId']" :options="options" label="分类" />
              </div>
            </q-grid-item>
          </q-grid>
        </q-tab-panel>
        <q-tab-panel name="setting">
          <div class="book-editor-stack column gap-16">
            <div>
              <div class="book-editor-stack column gap-8 light-radio">
                <div class="text-subtitle1">书籍等级</div>
                <div class="row items-center level-row">
                  <div class="col-12 col-sm q-px-sm">
                    <q-slider v-model="bookSetting['Level']" marker-labels :min="0" :max="6" />
                  </div>
                  <div v-if="appStore.user.InteriorLevel > 0" class="col-12 col-sm-auto">
                    <q-input
                      v-model.number="bookSetting['InteriorLevel']"
                      type="number"
                      label="书籍内部等级"
                      filled
                      :rules="[
                        (val) =>
                          (val <= appStore.user.InteriorLevel && val >= 0) ||
                          `输入的等级需大于0且小于${appStore.user.InteriorLevel}`,
                      ]"
                      style="width: 200px"
                    >
                      <template v-slot:append>
                        <q-icon name="mdiClose" @click="bookSetting['InteriorLevel'] = 0" class="cursor-pointer" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="book-editor-stack column items-start gap-8 light-radio">
                <div class="text-subtitle1">选项</div>
                <q-toggle v-model="bookSetting['DownloadAllowed']" label="允许下载" />
                <div class="text-caption text-opacity">关闭后用户无法下载本书</div>
              </div>
            </div>
            <div>
              <div class="book-editor-stack column gap-8 light-radio">
                <div class="text-subtitle1">分类信息</div>
                <div class="text-caption text-opacity">
                  由 AI 识别，决定本书归入哪个系列（系列名取「中文名 → 原名 →
                  书名」）。手工保存后本书不再参与自动分类。{{ classifiedAtText }}
                </div>
                <q-grid x-gap="16" y-gap="8" cols="2" xs="1">
                  <q-grid-item>
                    <q-input v-model="bookSetting['SeriesName']" label="系列名（原名）" filled />
                  </q-grid-item>
                  <q-grid-item>
                    <q-input v-model="bookSetting['SeriesNameCn']" label="系列中文名" filled />
                  </q-grid-item>
                  <q-grid-item>
                    <q-input
                      v-model.number="bookSetting['SeriesId']"
                      type="number"
                      label="系列 id"
                      hint="条目所属的 bgm.tv 系列主条目 id，留空表示没有"
                      filled
                      clearable
                      :rules="[(val) => val == null || val === '' || val > 0 || 'id 必须大于 0']"
                    />
                  </q-grid-item>
                  <q-grid-item>
                    <q-input
                      v-model.number="bookSetting['SubjectId']"
                      type="number"
                      label="条目 id"
                      hint="精确对应本书的 bgm.tv 条目 id，留空表示没有"
                      filled
                      clearable
                      :rules="[(val) => val == null || val === '' || val > 0 || 'id 必须大于 0']"
                    />
                  </q-grid-item>
                  <q-grid-item span="2" xs="1">
                    <q-select
                      v-model="bookSetting['Tags']"
                      label="标签"
                      hint="回车添加，标签用于按标签搜索"
                      filled
                      multiple
                      use-input
                      use-chips
                      hide-dropdown-icon
                      new-value-mode="add-unique"
                    />
                  </q-grid-item>
                </q-grid>
              </div>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="chapter">
          <q-input label="标题" v-model="chapter['Title']" />
          <comic-chapter-images v-if="isComic" v-model="chapter.Images" v-model:uploading="comicUploading" />
          <template v-else>
            <div class="text-opacity">内容</div>
            <html-editor :content="chapter['Content']" @update:html="chapter['Content'] = $event" mode="common" />
          </template>
        </q-tab-panel>
        <q-tab-panel name="new">
          <q-input label="标题" v-model="creatingChapterContent.title" />
          <comic-chapter-images
            v-if="isComic"
            v-model="creatingChapterContent.images"
            v-model:uploading="comicUploading"
          />
          <template v-else>
            <div class="text-opacity">内容</div>
            <html-editor
              :content="creatingChapterContent.html"
              @update:html="creatingChapterContent.html = $event"
              mode="common"
            />
          </template>
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
      <q-btn fab icon="mdiArrowLeft" color="accent" @click="show = !show" />
    </q-page-sticky>
    <drag-page-sticky v-slot="{ isDragging }">
      <q-fab icon="mdiPlus" direction="up" color="accent" :disable="isDragging">
        <q-fab-action color="primary" @click="save" icon="mdiContentSave" :disable="isDragging || getSaveState()">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            保存
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </drag-page-sticky>
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
              <q-btn flat round @click.stop="delChapter(index + 1)" icon="mdiDelete"></q-btn>
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
import { useQuasar } from 'quasar'
import Draggable from 'vuedraggable'

import { getErrMsg } from '@/utils/getErrMsg'
import { parseTime } from '@/utils/time'

import { useAppStore } from '@/stores/app'
import { useSettingStore } from '@/stores/setting'

import { HtmlEditor, DragPageSticky, ImageInput, ComicChapterImages } from '@/components'
import { useLayout } from '@/components/app/useLayout'
import { QGrid, QGridItem } from '@/components/grid'
import SystemImage from '@/components/SystemImage.vue'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { editBook, getBookEditInfo } from '@/services/book'
import {
  reorderChapter,
  createNewNovelChapter,
  deleteChapter,
  updateNovelChapter,
  getNovelEditInfo,
  createNewComicChapter,
  updateComicChapter,
  getComicEditInfo,
} from '@/services/chapter'

import type { BookServicesTypes } from '@/services/book'

const layout = useLayout()

const { siderShow, siderBreakpoint } = layout
const props = defineProps<{ bookId: string }>()
const { activeEditorMode } = useSettingStore()
const $q = useQuasar()
const route = useRoute()
const appStore = useAppStore()

//#region refs

const show = ref(false)
show.value = siderShow.value

const options = ref([])
// 只要数据中的id和props不同，就当在加载
const isActive = computed(() => book.value?.Id === _bid.value)
const disableDrawer = ref(false)
const book = ref<any>()
const isComic = computed(() => book.value?.Type === 'Comic')
const bookInfo = ref<BookServicesTypes.GetBookInfoRes>()
const chapters = ref([] as ChapterInfo[])
const _bid = computed(() => ~~(props.bookId || '1'))
const _cid = ref(-1)
const chapter = ref<ChapterEditState>({ Title: '加载中...', Content: '加载中...', Images: [] })
const chapterLoaded = ref(true)
const comicUploading = ref(false)
const comicCategoryNames = new Set(['原创', '连载', '完结'])
const comicOnlyCategoryNames = new Set(['连载', '完结'])
const creatingChapterContent = reactive<CreatingChapterState>({
  sortNum: '',
  title: '',
  html: '',
  images: [],
})
const tab = ref('information')
const bookSetting = reactive({} as BookSetting)
// 分类时间只读展示；分类字段本身在 bookSetting 里可改
const classification = ref<BookServicesTypes.BookClassification>({})
const classifiedAtText = computed(() =>
  classification.value.classified_at
    ? `上次分类：${parseTime(classification.value.classified_at).format('YYYY-MM-DD HH:mm')}`
    : '',
)
//#endregion

interface ChapterInfo {
  Id: number
  Title: string
}

interface ChapterEditState {
  Title: string
  Content?: string
  Images: string[]
}

interface CreatingChapterState {
  sortNum: string
  title: string
  html: string
  images: string[]
}

interface BookSetting {
  Level?: number
  InteriorLevel?: number
  DownloadAllowed?: boolean
  /** 以下五项落到 extra.classification */
  SubjectId?: number | null
  SeriesId?: number | null
  SeriesName?: string
  SeriesNameCn?: string
  Tags?: string[]
}

watch(
  () => _cid.value,
  async () => {
    const cid = _cid.value
    chapterLoaded.value = false
    if (cid <= 0) {
      chapterLoaded.value = true
      return
    }
    chapter.value = { Title: '加载中...', Content: '加载中...', Images: [] }
    try {
      const result = isComic.value
        ? await getComicEditInfo({ Bid: _bid.value, Cid: cid })
        : await getNovelEditInfo({ Bid: _bid.value, Cid: cid, Format: activeEditorMode })
      if (_cid.value === cid) {
        chapter.value = result as ChapterEditState
        chapter.value.Images ??= []
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrMsg(error) })
    } finally {
      if (_cid.value === cid) chapterLoaded.value = true
    }
  },
)

function getSaveState(): boolean {
  if (!isActive.value || comicUploading.value) return true
  return tab.value === 'chapter' && !chapterLoaded.value
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
    await editBook(_bid.value, toRaw(bookSetting))
    $q.notify({
      type: 'positive',
      message: '设置成功',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e),
    })
  }
}

async function saveInfo() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
  }).onOk(async () => {
    try {
      await editBook(_bid.value, toRaw(book.value))

      $q.notify({
        type: 'positive',
        message: '修改成功',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e),
      })
    }
  })
}

async function saveChapter() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
  }).onOk(async () => {
    try {
      if (isComic.value) {
        await updateComicChapter({
          Cid: _cid.value,
          Map: { Title: chapter.value.Title, Images: toRaw(chapter.value.Images) },
        })
      } else {
        await updateNovelChapter({ Cid: _cid.value, Map: toRaw(chapter.value) })
      }

      $q.notify({
        type: 'positive',
        message: '修改成功',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e),
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

    prompt: {
      label: '从1开始，0在最后（留空则在最后插入）',
      model: '',
      type: 'number',
    },
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
  }).onOk(async () => {
    try {
      const resp: ChapterInfo[] = <any>await deleteChapter({ Bid: _bid.value, SortNum: sortNum })
      if (chapters.value[sortNum - 1].Id === _cid.value) tab.value = 'information'
      chapters.value = resp
      $q.notify({
        type: 'positive',
        message: '删除成功',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e),
      })
    }
  })
}

async function createChapter() {
  try {
    const sort = ~~creatingChapterContent.sortNum
    const emptyTitle = !creatingChapterContent.title

    if (isComic.value) {
      if (creatingChapterContent.images.length === 0) {
        $q.notify({ type: 'warning', message: '请至少添加一张漫画图片' })
        return
      }

      if (emptyTitle) {
        $q.dialog({
          title: '警告',
          message: '章节标题为空，将使用“新章节”初始化。',
          cancel: true,
        }).onOk(async () => {
          creatingChapterContent.title = '新章节'
          await createComicChapterInner(sort)
        })
      } else {
        await createComicChapterInner(sort)
      }
      return
    }

    const emptyHtml = !creatingChapterContent.html

    if (emptyHtml || emptyTitle) {
      $q.dialog({
        title: '警告',
        message: `你的标题或内容为空，将使用默认值初始化：${emptyTitle && '<br/>章节名：新章节'}${
          emptyHtml && '<br/>内容：轻书架'
        }`,
        html: true,

        cancel: true,
      }).onOk(async () => {
        creatingChapterContent.html = '轻书架'
        creatingChapterContent.title = '新章节'
        await inner()
      })
    } else {
      await inner()
    }

    async function inner() {
      const { Chapters: resp, NewCid: cid } = <any>await createNewNovelChapter({
        Bid: _bid.value,
        SortNum: sort,
        Map: {
          Content: creatingChapterContent.html,
          Title: creatingChapterContent.title,
        },
      })
      $q.notify({
        type: 'positive',
        message: '新增成功',
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
      message: getErrMsg(e),
    })
  }
}

async function createComicChapterInner(sortNum: number) {
  const { Chapters: response, NewCid: cid } = <any>await createNewComicChapter({
    Bid: _bid.value,
    SortNum: sortNum,
    Map: {
      Title: creatingChapterContent.title,
      Images: toRaw(creatingChapterContent.images),
    },
  })
  $q.notify({ type: 'positive', message: '新增成功' })
  chapters.value = response
  creatingChapterContent.title = ''
  creatingChapterContent.images = []
  creatingChapterContent.sortNum = ''
  tab.value = 'chapter'
  _cid.value = cid
}

//#endregion

async function handleChange(evt) {
  disableDrawer.value = true
  const moved = evt.moved
  const { oldIndex, newIndex } = moved
  const oldSort = oldIndex + 1
  const newSort = newIndex + 1

  try {
    const changedList = await reorderChapter({
      BookId: _bid.value,
      OldSortNum: oldSort,
      NewSortNum: newSort,
    })
    chapters.value = <ChapterInfo[]>changedList
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e),
    })

    const tempValue = chapters.value[newIndex]
    chapters.value.splice(newIndex, 1)
    chapters.value.splice(oldIndex - 1 >= 0 ? oldIndex : 0, 0, tempValue)
  }
  disableDrawer.value = false
}

const request = useTimeoutFn(async () => {
  const p1 = getBookEditInfo(_bid.value, activeEditorMode).then((data: any) => {
    bookInfo.value = data
    const categories =
      data.Book.Type === 'Comic'
        ? data.Categories.filter((item) => comicCategoryNames.has(item.Name))
        : data.Categories.filter((item) => !comicOnlyCategoryNames.has(item.Name))
    options.value = categories.map((item) => {
      return {
        label: item.Name,
        value: item.Id,
      }
    })
    chapters.value = <ChapterInfo[]>data.Book.Chapters
    book.value = data.Book

    bookSetting.Level = data.Book.Level
    bookSetting.InteriorLevel = data.Book.InteriorLevel
    // 后端已按书籍类型解析好默认值
    bookSetting.DownloadAllowed = data.Book.DownloadAllowed

    classification.value = data.Book.Extra?.classification ?? {}
    bookSetting.SubjectId = classification.value.subject_id ?? null
    bookSetting.SeriesId = classification.value.series_id ?? null
    bookSetting.SeriesName = classification.value.series_name ?? ''
    bookSetting.SeriesNameCn = classification.value.series_name_cn ?? ''
    bookSetting.Tags = [...(classification.value.tags ?? [])]
  })

  await p1
})

const refresh = () => {
  // refresh page data when back to another book.
  chapter.value = { Title: '加载中...', Content: '加载中...', Images: [] }
  _cid.value = -1
  tab.value = 'information'
  creatingChapterContent.title = ''
  creatingChapterContent.html = ''
  creatingChapterContent.images = []
  creatingChapterContent.sortNum = ''
}
useInitRequest(request, { before: refresh, isActive })
</script>

<style lang="scss" scoped>
.book-editor-panels {
  :deep(.q-tab-panel) {
    padding: 16px !important;
  }
}

.book-editor-stack,
.book-editor-stack > * {
  min-width: 0;
}

// q-col-gutter-* 靠负 margin 撑开，会把滑块和它的刻度顶到区块左边界外面，这里用 gap 代替
.level-row {
  gap: 8px 16px;
}
</style>
