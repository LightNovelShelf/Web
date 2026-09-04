<template>
  <q-page style="max-width: 1920px" class="book-editor-page q-mx-auto">
    <div v-if="isActive">
      <q-tab-panels v-model="tab" class="book-editor-panels">
        <q-tab-panel name="information">
          <book-info-fields v-if="book" v-model="book" :category-options="options" />
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
                  <div v-if="appStore.user && appStore.user.InteriorLevel > 0" class="col-12 col-sm-auto">
                    <q-input
                      v-model.number="bookSetting['InteriorLevel']"
                      type="number"
                      label="书籍内部等级"
                      filled
                      :rules="[
                        (val) =>
                          (val <= (appStore.user?.InteriorLevel ?? 0) && val >= 0) ||
                          `输入的等级需大于0且小于${appStore.user?.InteriorLevel ?? 0}`,
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
                <div class="classification-grid">
                  <div>
                    <q-input v-model="bookSetting['SeriesName']" label="系列名（原名）" filled />
                  </div>
                  <div>
                    <q-input v-model="bookSetting['SeriesNameCn']" label="系列中文名" filled />
                  </div>
                  <div>
                    <q-input
                      v-model.number="bookSetting['SeriesId']"
                      type="number"
                      label="系列 id"
                      hint="条目所属的 bgm.tv 系列主条目 id，留空表示没有"
                      filled
                      clearable
                      :rules="[(val) => val == null || val === '' || val > 0 || 'id 必须大于 0']"
                    />
                  </div>
                  <div>
                    <q-input
                      v-model.number="bookSetting['SubjectId']"
                      type="number"
                      label="条目 id"
                      hint="精确对应本书的 bgm.tv 条目 id，留空表示没有"
                      filled
                      clearable
                      :rules="[(val) => val == null || val === '' || val > 0 || 'id 必须大于 0']"
                    />
                  </div>
                  <div class="classification-grid__wide">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="chapter">
          <template v-if="chapter">
            <q-input v-if="isComic" label="标题" v-model="chapter.Title" />
            <comic-chapter-images v-if="isComic" v-model="chapter.Images" v-model:uploading="comicUploading" />
            <novel-chapter-fields v-else v-model="chapter" />
          </template>
        </q-tab-panel>
        <q-tab-panel name="new">
          <q-input v-if="isComic" label="标题" v-model="creatingChapterContent.Title" />
          <comic-chapter-images
            v-if="isComic"
            v-model="creatingChapterContent.Images"
            v-model:uploading="comicUploading"
          />
          <novel-chapter-fields v-else v-model="creatingChapterModel" />
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
    <editor-save-action :disabled="getSaveState()" @save="save" />
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
                selectedChapterId = element.Id
                tab = 'chapter'
              }
            "
            :active="tab === 'chapter' && selectedChapterId === element.Id"
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
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useRoute } from 'vue-router'
import Draggable from 'vuedraggable'

import { getErrMsg } from '@/utils/getErrMsg'
import { parseTime } from '@/utils/time'

import { useSessionStore } from '@/stores/session'
import { useSettingStore } from '@/stores/setting'

import { ComicChapterImages } from '@/components'
import { useLayout } from '@/components/app/useLayout'
import { BookInfoFields, EditorSaveAction, NovelChapterFields } from '@/components/editor'
import { buildBookCategoryOptions, toBookInfoUpdate } from '@/components/editor/bookEditOptions'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useEditorAction } from '@/composition/editor/useEditorAction'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { editBook, getBookEditInfo } from '@/services/book'
import {
  createNewComicChapter,
  createNewNovelChapter,
  deleteChapter,
  getComicEditInfo,
  getNovelEditInfo,
  reorderChapter,
  updateComicChapter,
  updateNovelChapter,
} from '@/services/chapter'

import type { BookCategoryOption } from '@/components/editor/bookEditOptions'
import type { BookClassification, EditBookRequest, EditableBook } from '@/services/book/types'
import type { ChapterEditState, ChapterInfo, ChapterTextContent, CreateChapterResponse } from '@/services/chapter/types'

type EditorTab = 'information' | 'setting' | 'chapter' | 'new'

interface CreatingChapterState extends ChapterTextContent {
  sortNum: string
  Content: string
  Images: string[]
}

interface BookSetting extends Pick<
  EditBookRequest,
  'Level' | 'InteriorLevel' | 'DownloadAllowed' | 'SubjectId' | 'SeriesId' | 'SeriesName' | 'SeriesNameCn' | 'Tags'
> {}

interface DraggableChangeEvent {
  moved?: { oldIndex: number; newIndex: number }
}

const { siderShow, siderBreakpoint } = useLayout()
const props = defineProps<{ bookId: string }>()
const { activeEditorMode } = useSettingStore()
const $q = useQuasar()
const route = useRoute()
const appStore = useSessionStore()
const { saving, runEditorAction } = useEditorAction()

const show = ref(siderShow.value)
const options = ref<BookCategoryOption[]>([])
const disableDrawer = ref(false)
const book = ref<EditableBook>()
const chapters = ref<ChapterInfo[]>([])
const bookId = computed(() => Number(props.bookId))
const selectedChapterId = ref(-1)
const chapter = ref<ChapterEditState>()
const chapterLoaded = ref(true)
const comicUploading = ref(false)
const creatingChapterContent = reactive<CreatingChapterState>({
  sortNum: '',
  Title: '',
  Content: '',
  Images: [],
})
const creatingChapterModel = computed<CreatingChapterState>({
  get: () => creatingChapterContent,
  set: (value) => Object.assign(creatingChapterContent, value),
})
const tab = ref<EditorTab>('information')
const bookSetting = reactive<BookSetting>({})
const classification = ref<BookClassification>({})

const isActive = computed(() => book.value?.Id === bookId.value)
const isComic = computed(() => book.value?.Type === 'Comic')
const classifiedAtText = computed(() =>
  classification.value.classified_at
    ? `上次分类：${parseTime(classification.value.classified_at).format('YYYY-MM-DD HH:mm')}`
    : '',
)

watch(selectedChapterId, async (chapterId) => {
  chapter.value = undefined
  chapterLoaded.value = false
  if (chapterId <= 0) {
    chapterLoaded.value = true
    return
  }

  const requestedBookId = bookId.value
  try {
    const response = isComic.value
      ? await getComicEditInfo({ Cid: chapterId })
      : await getNovelEditInfo({ Cid: chapterId, Format: activeEditorMode })
    if (selectedChapterId.value === chapterId && bookId.value === requestedBookId) {
      chapter.value = { ...response, Images: response.Images ?? [] }
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrMsg(error) })
  } finally {
    if (selectedChapterId.value === chapterId) chapterLoaded.value = true
  }
})

function getSaveState(): boolean {
  if (saving.value || !isActive.value || comicUploading.value) return true
  return tab.value === 'chapter' && (!chapterLoaded.value || !chapter.value)
}

async function save() {
  if (tab.value === 'new') await createChapter()
  else if (tab.value === 'information') await saveInfo()
  else if (tab.value === 'setting') await saveSetting()
  else if (tab.value === 'chapter') await saveChapter()
}

async function saveSetting() {
  await runEditorAction({ successMessage: '设置成功' }, () => editBook(bookId.value, toRaw(bookSetting)))
}

async function saveInfo() {
  if (!book.value) return
  const currentBook = book.value
  await runEditorAction({ content: currentBook.Introduction, confirmWhenClean: true }, () =>
    editBook(bookId.value, toRaw(toBookInfoUpdate(currentBook))),
  )
}

async function saveChapter() {
  if (!chapter.value) return
  const currentChapter = chapter.value
  const saved = await runEditorAction(
    {
      content: isComic.value ? '' : (currentChapter.Content ?? ''),
      confirmWhenClean: true,
    },
    () =>
      isComic.value
        ? updateComicChapter({
            Cid: currentChapter.Id,
            Map: { Title: currentChapter.Title, Images: toRaw(currentChapter.Images ?? []) },
          })
        : updateNovelChapter({
            Cid: currentChapter.Id,
            Map: { Title: currentChapter.Title, Content: currentChapter.Content ?? '' },
          }),
  )
  if (!saved) return

  chapters.value = chapters.value.map((item) =>
    item.Id === currentChapter.Id ? { Id: item.Id, Title: currentChapter.Title } : item,
  )
}

function addChapter() {
  $q.dialog({
    title: '章节顺序',
    cancel: true,
    prompt: {
      label: '从1开始，0在最后（留空则在最后插入）',
      model: '',
      type: 'number',
    },
  }).onOk((value) => {
    creatingChapterContent.sortNum = value
    tab.value = 'new'
  })
}

function delChapter(sortNum: number) {
  $q.dialog({
    title: '提示',
    message: '该章节将被永久删除！',
    cancel: true,
  }).onOk(async () => {
    const deletingId = chapters.value[sortNum - 1]?.Id
    await runEditorAction({ successMessage: '删除成功' }, async () => {
      chapters.value = await deleteChapter({ Bid: bookId.value, SortNum: sortNum })
      if (deletingId === selectedChapterId.value) {
        selectedChapterId.value = -1
        tab.value = 'information'
      }
    })
  })
}

async function createChapter() {
  const sortNum = Number(creatingChapterContent.sortNum) || 0
  const missingTitle = !creatingChapterContent.Title

  if (isComic.value) {
    if (creatingChapterContent.Images.length === 0) {
      $q.notify({ type: 'warning', message: '请至少添加一张漫画图片' })
      return
    }
    if (missingTitle && !(await confirmDefaultContent('章节标题为空，将使用“新章节”初始化。'))) return
    if (missingTitle) creatingChapterContent.Title = '新章节'

    await runEditorAction({ successMessage: '新增成功' }, async () => {
      finishChapterCreation(
        await createNewComicChapter({
          Bid: bookId.value,
          SortNum: sortNum,
          Map: {
            Title: creatingChapterContent.Title,
            Images: toRaw(creatingChapterContent.Images),
          },
        }),
      )
    })
    return
  }

  const missingContent = !creatingChapterContent.Content
  if (
    (missingTitle || missingContent) &&
    !(await confirmDefaultContent(
      `你的标题或内容为空，将使用默认值初始化：${missingTitle ? '<br/>章节名：新章节' : ''}${
        missingContent ? '<br/>内容：轻书架' : ''
      }`,
      true,
    ))
  ) {
    return
  }
  if (missingTitle) creatingChapterContent.Title = '新章节'
  if (missingContent) creatingChapterContent.Content = '轻书架'

  await runEditorAction({ content: creatingChapterContent.Content, successMessage: '新增成功' }, async () => {
    finishChapterCreation(
      await createNewNovelChapter({
        Bid: bookId.value,
        SortNum: sortNum,
        Map: {
          Content: creatingChapterContent.Content,
          Title: creatingChapterContent.Title,
        },
      }),
    )
  })
}

function confirmDefaultContent(message: string, html = false): Promise<boolean> {
  return new Promise((resolve) => {
    let confirmed = false
    $q.dialog({ title: '警告', message, html, cancel: true })
      .onOk(() => {
        confirmed = true
      })
      .onDismiss(() => resolve(confirmed))
  })
}

function finishChapterCreation(response: CreateChapterResponse) {
  chapters.value = response.Chapters
  creatingChapterContent.Title = ''
  creatingChapterContent.Content = ''
  creatingChapterContent.Images = []
  creatingChapterContent.sortNum = ''
  tab.value = 'chapter'
  selectedChapterId.value = response.NewCid
}

async function handleChange(event: DraggableChangeEvent) {
  const moved = event.moved
  if (!moved) return

  disableDrawer.value = true
  try {
    chapters.value = await reorderChapter({
      BookId: bookId.value,
      OldSortNum: moved.oldIndex + 1,
      NewSortNum: moved.newIndex + 1,
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrMsg(error) })
    const [movedChapter] = chapters.value.splice(moved.newIndex, 1)
    if (movedChapter) chapters.value.splice(moved.oldIndex, 0, movedChapter)
  } finally {
    disableDrawer.value = false
  }
}

const request = useTimeoutFn(async () => {
  const requestedBookId = bookId.value
  const data = await getBookEditInfo(requestedBookId, activeEditorMode)
  if (bookId.value !== requestedBookId) return

  options.value = buildBookCategoryOptions(data)
  chapters.value = data.Book.Chapters
  book.value = data.Book
  bookSetting.Level = data.Book.Level
  bookSetting.InteriorLevel = data.Book.InteriorLevel
  bookSetting.DownloadAllowed = data.Book.DownloadAllowed

  classification.value = data.Book.Extra?.classification ?? {}
  bookSetting.SubjectId = classification.value.subject_id ?? null
  bookSetting.SeriesId = classification.value.series_id ?? null
  bookSetting.SeriesName = classification.value.series_name ?? ''
  bookSetting.SeriesNameCn = classification.value.series_name_cn ?? ''
  bookSetting.Tags = [...(classification.value.tags ?? [])]
})

function resetEditor() {
  chapter.value = undefined
  selectedChapterId.value = -1
  tab.value = 'information'
  creatingChapterContent.Title = ''
  creatingChapterContent.Content = ''
  creatingChapterContent.Images = []
  creatingChapterContent.sortNum = ''
}

useInitRequest(request, { before: resetEditor, isActive })
</script>

<style lang="scss" scoped>
.book-editor-page,
.book-editor-panels,
.book-editor-panels :deep(.q-panel),
.book-editor-panels :deep(.q-tab-panel) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.book-editor-panels :deep(.q-tab-panel) {
  padding: 16px !important;
}

.book-editor-stack,
.book-editor-stack > * {
  min-width: 0;
}

.classification-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  width: 100%;
  min-width: 0;
}

.classification-grid > *,
.classification-grid__wide {
  min-width: 0;
}

.classification-grid__wide {
  grid-column: 1 / -1;
}

@media screen and (max-width: $breakpoint-xs-max) {
  .classification-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

// q-col-gutter-* 靠负 margin 撑开，会把滑块和它的刻度顶到区块左边界外面，这里用 gap 代替
.level-row {
  gap: 8px 16px;
}
</style>
