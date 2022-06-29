<template>
  <q-page padding style="max-width: 1080px;" class="mx-auto">
    <div v-if="isActive">
      <div v-if="currentChapter === -1 && !creatingChapter">
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
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
      </div>

      <div v-else-if="creatingChapter">
        <q-btn :icon="icon.mdiClose" @click.prevent="creatingChapter = false">关闭</q-btn>
        <q-input label="标题" v-model="creatingChapterContent.title" />
        <div class="text-opacity">内容</div>
        <html-editor v-model:html="creatingChapterContent.html" mode="common" />
      </div>

      <div v-else>
        <div v-if="chapterLoaded">
          <q-input label="标题" v-model="chapter['Title']" />
          <div class="text-opacity">内容</div>
          <html-editor v-model:html="chapter['Content']" mode="common" />
        </div>
        <div v-else class="absolute-full">
          <q-inner-loading
            :showing="!chapterLoaded"
            label="加载中..."
            label-class="text-teal"
            label-style="font-size: 1.1em"
          />
        </div>
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
        :disable="!isActive || draggingFab || !chapterLoaded"
        v-touch-pan.prevent.mouse="moveFab"
        @click="save()"
      ></q-btn>
    </q-page-sticky>
  </q-page>
  <q-drawer v-model="show" side="right" bordered :width="240" :breakpoint="siderBreakpoint">
    <q-scroll-area class="fit">
      <q-item clickable v-ripple :active="currentChapter === -1" @click="currentChapter = -1">
        <q-item-section> 信息 </q-item-section>
      </q-item>
      <q-separator class="q-my-sm" />
      <Draggable
        v-model="showChapters"
        :animation="100"
        item-key="id"
        class="list-group"
        ghost-class="ghost"
        @change="handleChange"
      >
        <template #item="{ element }">
          <q-item
            clickable
            v-ripple
            @click="currentChapter = element.id + 1"
            :active="currentChapter - 1 === element.id"
            :disable="disableDrawer"
          >
            <q-item-section>{{ element.value }}</q-item-section>
            <q-item-section side>
              <q-btn flat round @click.prevent="delChapter(element.id + 1)" :icon="icon.mdiDelete"></q-btn>
            </q-item-section>
          </q-item>
        </template>
      </Draggable>
      <q-separator class="q-my-sm" />
      <q-item>
        <q-item-section>
          <q-btn color="secondary" @click.prevent="addChapter()" :disable="!isActive || draggingFab || !chapterLoaded">
            新增
          </q-btn>
        </q-item-section>
      </q-item>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { useLayout } from 'src/components/app/useLayout'
import { useSettingStore } from '../../stores/setting'
import { QGrid, QGridItem } from 'src/components/grid'
import { icon } from 'assets/icon'
import { BookServicesTypes, editBook, getBookEditInfo } from 'src/services/book'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useQuasar } from 'quasar'
import { HtmlEditor } from 'src/components'
import { getErrMsg } from 'src/utils/getErrMsg'
import Draggable from 'vuedraggable'
import {
  createNewChapter,
  deleteChapter,
  changeChapterSort,
  editChapterContent,
  getChapterEditInfo
} from '../../services/chapter/index'

const settingStore = useSettingStore()
const layout = useLayout()
const { siderShow, siderBreakpoint } = layout
const props = defineProps<{ bookId: string }>()
const $q = useQuasar()

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
let chapters = ref([] as string[])
let showChapters = ref([])
let _bid = computed(() => ~~(props.bookId || '1'))
let currentChapter = ref(-1)
let chapter = ref<any>(undefined)
let chapterLoaded = ref(true)
let creatingChapter = ref(false)
let creatingChapterContent = reactive({
  sortNum: '',
  title: '',
  html: ''
})

watch(currentChapter, async () => {
  if (currentChapter.value === -1) return
  chapterLoaded.value = false
  chapter.value = await getChapterEditInfo({ BookId: _bid.value, SortNum: currentChapter.value })
  chapterLoaded.value = true
})

async function save() {
  if (creatingChapter.value) {
    await createChapter()
    return
  }
  if (currentChapter.value === -1) {
    await saveInfo()
    return
  } else {
    await saveChapter()
    return
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
      if (sortNum === chapters.value.length) sortNum = 0
      await deleteChapter({ BookId: _bid.value, SortNum: sortNum })
      chapters.value.splice(sortNum - 1, 1)
      showChapters.value = chapters.value.map((v, i) => {
        return {
          id: i,
          value: v
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
    let sort = Number.parseInt(creatingChapterContent.sortNum)
    if (sort === NaN) {
      sort = 0
    }
    await createNewChapter({
      BookId: _bid.value,
      SortNum: sort,
      Content: creatingChapterContent.html,
      Title: creatingChapterContent.title
    })
    $q.notify({
      type: 'positive',
      message: '新增成功'
    })
    if (sort === 0) {
      chapters.value.push(creatingChapterContent.title)
    } else {
      chapters.value.splice(sort - 1, 0, creatingChapterContent.title)
    }

    showChapters.value = chapters.value.map((v, i) => {
      return {
        id: i,
        value: v
      }
    })
    creatingChapter.value = false
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })
  }
}

async function handleChange(evt) {
  disableDrawer.value = true
  const moved = evt.moved
  const { oldIndex, newIndex } = moved
  let oldSort,
    newSort = -1
  if (<number>oldIndex + 1 !== chapters.value.length) {
    oldSort = oldIndex + 1
  } else {
    oldSort = 0
  }
  if (<number>newIndex + 1 !== chapters.value.length) {
    newSort = newIndex + 1
  } else {
    newSort = 0
  }

  try {
    await changeChapterSort({ BookId: _bid.value, OldSortNum: oldSort, NewSortNum: newSort })
    const data = (await getBookEditInfo(_bid.value)) as any
    chapters.value = <string[]>data.Book.Chapters
    showChapters.value = chapters.value.map((v, i) => {
      return {
        id: i,
        value: v
      }
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e)
    })[(chapters.value[oldIndex], chapters.value[newIndex])] = [chapters.value[newIndex], chapters.value[oldIndex]]
    showChapters.value = chapters.value.map((v, i) => {
      return {
        id: i,
        value: v
      }
    })
  }
  disableDrawer.value = false
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

const request = useTimeoutFn(async () => {
  //去他妈的AnyScript，懒得改类型了
  const data = (await getBookEditInfo(_bid.value)) as any
  bookInfo.value = data
  options.value = data.Categories.map((item) => {
    return {
      label: item.Name,
      value: item.Id
    }
  })
  chapters.value = <string[]>data.Book.Chapters
  showChapters.value = chapters.value.map((v, i) => {
    return {
      id: i,
      value: v
    }
  })
  book.value = data.Book
})
useInitRequest(request, { isActive })
</script>

<style lang="scss" scoped></style>
