<template>
  <q-page padding class="thread-create" :style-fn="pageStyleFn">
    <div class="thread-create__meta" :class="{ 'thread-create__meta--single': !subCategoryOptions.length }">
      <q-select
        v-model="boardKey"
        class="thread-create__field"
        dense
        outlined
        emit-value
        map-options
        label="板块"
        :options="boardOptions"
        :loading="!catalogLoaded"
      />

      <q-select
        v-if="subCategoryOptions.length"
        v-model="subCategoryKey"
        class="thread-create__field"
        dense
        outlined
        emit-value
        map-options
        label="子分类"
        :options="subCategoryOptions"
      />

      <q-input
        v-model="title"
        class="thread-create__field thread-create__field--title"
        dense
        outlined
        maxlength="60"
        label="标题"
      />
    </div>

    <div class="thread-create__hint">
      <span>标题至少 6 个字，正文至少 20 个字。</span>
      <span v-if="backupSavedAt">草稿已备份于 {{ backupSavedAtText }}</span>
    </div>

    <div ref="editorShellRef" class="thread-create__editor">
      <html-editor v-model:html="contentHtml" mode="common" />
    </div>

    <drag-page-sticky v-slot="{ isDragging }">
      <q-fab icon="mdiPlus" direction="up" color="accent" :disable="isDragging">
        <q-fab-action
          color="primary"
          :icon="isEdit ? 'mdiContentSave' : 'mdiSend'"
          :disable="isDragging || !canSubmit || submitting"
          @click="submit"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            {{ isEdit ? '保存修改' : '发布帖子' }}
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </drag-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import { useDebounceFn, useMutationObserver, watchDebounced } from '@vueuse/core'
import dayjs from 'dayjs'
import { OverlayScrollbars } from 'overlayscrollbars'
import { useQuasar } from 'quasar'

import sanitizeHtml from '@/utils/sanitizeHtml'

import { useAppStore } from '@/stores/app'

import { DragPageSticky } from '@/components'
import HtmlEditor from '@/components/html/HtmlEditor.vue'

import { createCommunityThread, getCommunityCatalog, getCommunityThread, updateCommunityThread } from '@/services/forum'

import type { CommunityCatalogBoard } from '@/services/forum'
import type { OverlayScrollbars as OverlayScrollbarsInstance } from 'overlayscrollbars'

interface ThreadDraft {
  boardKey: string
  subCategoryKey: string
  title: string
  contentHtml: string
  savedAt: number
}

const DRAFT_STORAGE_KEY_PREFIX = 'light-novel-shelf:forum-thread-draft'
const EMPTY_CONTENT = '<p></p>'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 编辑态由 /forum/thread/:id/edit 复用本页，id 只在编辑时存在
const props = defineProps<{ id?: string }>()
const threadId = computed(() => (props.id ? ~~props.id : 0))
const isEdit = computed(() => threadId.value > 0)
// 编辑草稿按帖子分开存，不跟新帖草稿互相覆盖
const draftStorageKey = computed(() =>
  isEdit.value ? `${DRAFT_STORAGE_KEY_PREFIX}:${threadId.value}` : DRAFT_STORAGE_KEY_PREFIX,
)
const threadLoaded = ref(false)

const catalogBoards = ref<CommunityCatalogBoard[]>([])
const catalogLoaded = ref(false)
const boardKey = ref('')
const subCategoryKey = ref('')
const title = ref('')
const contentHtml = ref(EMPTY_CONTENT)
const submitting = ref(false)
const backupSavedAt = ref(0)
// 还原询问没结束前不许自动备份，否则空表单会把备份覆盖掉
const backupArmed = ref(false)
const editorShellRef = ref<HTMLElement | null>(null)
let editorScrollbarInstances: OverlayScrollbarsInstance[] = []

const catalogBoardMap = computed(() => new Map(catalogBoards.value.map((item) => [item.Key, item])))

const boardOptions = computed(() => catalogBoards.value.map((item) => ({ label: item.Title, value: item.Key })))

const subCategoryOptions = computed(() =>
  (catalogBoardMap.value.get(boardKey.value)?.SubCategories ?? []).map((item) => ({
    label: item.Label,
    value: item.Key,
  })),
)

const plainTextLength = computed(() => getPlainTextFromHtml(contentHtml.value).replace(/\s+/g, '').length)

const canSubmit = computed(
  () =>
    !!boardKey.value &&
    // 板块有子分类时必填，无子分类的板块不强制
    (!subCategoryOptions.value.length || !!subCategoryKey.value) &&
    title.value.trim().length >= 6 &&
    plainTextLength.value >= 20,
)

const isEmptyForm = computed(() => !title.value.trim() && plainTextLength.value === 0)

const backupSavedAtText = computed(() => dayjs(backupSavedAt.value).format('MM-DD HH:mm:ss'))

// 页面自身不产生滚动条，滚动交给编辑器内部
function pageStyleFn(offset: number, height: number) {
  return { height: height ? `${height - offset}px` : `calc(100vh - ${offset}px)` }
}

function getPlainTextFromHtml(html: string) {
  const div = document.createElement('div')
  div.innerHTML = sanitizeHtml(html)
  const text = div.textContent?.trim() ?? ''
  div.remove()
  return text
}

function readDraft(): ThreadDraft | null {
  try {
    const raw = window.localStorage.getItem(draftStorageKey.value)
    if (!raw) return null

    const parsed = JSON.parse(raw) as ThreadDraft
    if (typeof parsed?.title !== 'string' || typeof parsed?.contentHtml !== 'string') return null

    return parsed
  } catch {
    return null
  }
}

function writeDraft() {
  const draft: ThreadDraft = {
    boardKey: boardKey.value,
    subCategoryKey: subCategoryKey.value,
    title: title.value,
    contentHtml: contentHtml.value,
    savedAt: Date.now(),
  }

  window.localStorage.setItem(draftStorageKey.value, JSON.stringify(draft))
  backupSavedAt.value = draft.savedAt
}

function clearDraft() {
  window.localStorage.removeItem(draftStorageKey.value)
  backupSavedAt.value = 0
}

function applyDraft(draft: ThreadDraft) {
  boardKey.value = draft.boardKey ?? ''
  subCategoryKey.value = draft.subCategoryKey ?? ''
  title.value = draft.title
  contentHtml.value = draft.contentHtml || EMPTY_CONTENT
  backupSavedAt.value = draft.savedAt ?? 0
}

function hasDraftContent(draft: ThreadDraft | null): draft is ThreadDraft {
  return !!draft && (!!draft.title.trim() || getPlainTextFromHtml(draft.contentHtml).length > 0)
}

function askRestore(onDecline?: () => void) {
  const draft = readDraft()
  if (!hasDraftContent(draft)) {
    backupSavedAt.value = 0
    backupArmed.value = true
    onDecline?.()
    return
  }

  backupSavedAt.value = draft.savedAt ?? 0

  $q.dialog({
    title: '发现草稿备份',
    message: `检测到 ${dayjs(draft.savedAt).format('MM-DD HH:mm:ss')} 备份的未发布内容，是否还原？`,
    ok: { label: '还原', color: 'primary', unelevated: true, noCaps: true },
    cancel: { label: '不还原', color: 'grey-7', flat: true, noCaps: true },
    persistent: true,
  })
    .onOk(() => {
      applyDraft(draft)
      backupArmed.value = true
    })
    .onCancel(() => {
      onDecline?.()
      backupArmed.value = true
    })
}

function syncBoardFromQuery() {
  // 从具体板块进来时沿用该板块上下文，"全部"或无效则留空
  const queryBoard = typeof route.query.board === 'string' ? route.query.board.trim() : ''
  boardKey.value = queryBoard && queryBoard !== 'all' && catalogBoardMap.value.has(queryBoard) ? queryBoard : ''

  const queryCategory = typeof route.query.category === 'string' ? route.query.category.trim() : ''
  subCategoryKey.value = subCategoryOptions.value.some((item) => item.value === queryCategory) ? queryCategory : ''
}

async function loadCatalog() {
  try {
    const payload = await getCommunityCatalog()
    catalogBoards.value = payload.CatalogBoards
  } catch (err) {
    $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '板块加载失败' })
  } finally {
    catalogLoaded.value = true
  }
}

// 编辑态的初始内容：BodyHtml 是解码 + 签名后的正文，回存时 ImageEncoder 会按图片路径还原成 {res:id}
async function loadThread() {
  try {
    const thread = await getCommunityThread(threadId.value, 1, 1, { trackView: false })
    if (!thread) {
      $q.notify({ type: 'negative', message: '帖子不存在' })
      await router.replace({ name: 'ForumList' })
      return
    }

    if (!thread.CanEdit) {
      $q.notify({ type: 'warning', message: '没有权限编辑这个帖子' })
      await router.replace({ name: 'ForumThread', params: { id: threadId.value } })
      return
    }

    boardKey.value = thread.BoardKey
    subCategoryKey.value = thread.SubCategoryKey ?? ''
    title.value = thread.Title
    contentHtml.value = thread.BodyHtml || EMPTY_CONTENT
    threadLoaded.value = true
  } catch (err) {
    $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '帖子加载失败' })
  }
}

async function submit() {
  if (!canSubmit.value || submitting.value) return

  if (!appStore.user) {
    $q.notify({ type: 'warning', message: '请先登录后再发帖' })
    void router.push({ name: 'Login', query: { from: encodeURIComponent(route.fullPath) } })
    return
  }

  submitting.value = true

  try {
    if (isEdit.value) {
      await updateCommunityThread({
        threadId: threadId.value,
        boardKey: boardKey.value,
        subCategoryKey: subCategoryKey.value || undefined,
        title: title.value.trim(),
        contentHtml: contentHtml.value,
      })

      clearDraft()
      $q.notify({ type: 'positive', message: '帖子已更新' })
      await router.replace({ name: 'ForumThread', params: { id: threadId.value } })
      return
    }

    const created = await createCommunityThread({
      boardKey: boardKey.value,
      subCategoryKey: subCategoryKey.value || undefined,
      title: title.value.trim(),
      contentHtml: contentHtml.value,
    })

    clearDraft()
    title.value = ''
    contentHtml.value = EMPTY_CONTENT

    $q.notify({ type: 'positive', message: '帖子已发布' })
    await router.replace({ name: 'ForumThread', params: { id: created.Id } })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : isEdit.value ? '保存失败' : '发布失败',
    })
  } finally {
    submitting.value = false
  }
}

function destroyEditorScrollbars() {
  editorScrollbarInstances.forEach((instance) => instance.destroy())
  editorScrollbarInstances = []
}

// markdown 编辑器用 md-editor-v3 自带的滚动条，这里只接管 q-editor（html 模式）的内容区；
// 编辑器种类由设置切换，DOM 可能在挂载之后才出现，所以初始化要能重复调用
function syncEditorScrollbars() {
  const targets = editorShellRef.value?.querySelectorAll<HTMLElement>('.q-editor__content')

  editorScrollbarInstances = editorScrollbarInstances.filter((instance) => {
    if (instance.state().destroyed) return false

    const target = instance.elements().target
    if (target.isConnected) return true

    instance.destroy()
    return false
  })

  targets?.forEach((target) => {
    // 目标已经有实例就跳过，重复初始化会叠出第二套滚动条
    if (OverlayScrollbars(target)) return

    editorScrollbarInstances.push(
      OverlayScrollbars(
        {
          target,
          elements: {
            viewport: target,
            padding: false,
            content: false,
          },
          scrollbars: {
            slot: target.parentElement,
          },
        },
        {
          overflow: {
            x: 'hidden',
            y: 'scroll',
          },
          scrollbars: {
            theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark',
            autoHide: 'move',
            autoHideDelay: 300,
            autoHideSuspend: false,
          },
        },
      ),
    )
  })
}

// 编辑器种类切换会整块换掉 DOM，靠 observer 补挂；debounce 合并同一批 DOM 变动
const syncEditorScrollbarsSoon = useDebounceFn(syncEditorScrollbars, 50)

useMutationObserver(editorShellRef, () => void syncEditorScrollbarsSoon(), { childList: true, subtree: true })

watch(
  () => $q.dark.isActive,
  () => {
    editorScrollbarInstances.forEach((instance) => {
      instance.options({ scrollbars: { theme: $q.dark.isActive ? 'os-theme-light' : 'os-theme-dark' } })
    })
  },
)

watch(boardKey, () => {
  // 目录没到之前子分类选项一定是空的，这时候清空会把还原出来的草稿抹掉
  if (catalogLoaded.value && !subCategoryOptions.value.some((item) => item.value === subCategoryKey.value)) {
    subCategoryKey.value = ''
  }
})

watchDebounced(
  () => [boardKey.value, subCategoryKey.value, title.value, contentHtml.value].join('\u0000'),
  () => {
    if (!backupArmed.value || isEmptyForm.value) return

    writeDraft()
  },
  { debounce: 800, maxWait: 5000 },
)

// 同一目标（新帖 / 某个帖子的编辑）只在第一次进入时问一次还原，keep-alive 回来不重复打扰
let restorePromptedFor = ''

// 进入页面先补齐板块目录，编辑态再拉帖子原文，最后决定用草稿、原文还是路由上下文
async function prepare() {
  if (!catalogLoaded.value) {
    await loadCatalog()
  }

  if (isEdit.value && !threadLoaded.value) {
    await loadThread()
  }

  if (restorePromptedFor === draftStorageKey.value) {
    backupArmed.value = true
    return
  }

  restorePromptedFor = draftStorageKey.value
  backupArmed.value = false
  askRestore(isEdit.value ? undefined : syncBoardFromQuery)
}

function resetForm() {
  threadLoaded.value = false
  backupArmed.value = false
  backupSavedAt.value = 0
  boardKey.value = ''
  subCategoryKey.value = ''
  title.value = ''
  contentHtml.value = EMPTY_CONTENT
}

// keep-alive 下发帖页与编辑页共用同一个实例，目标换了必须清掉上一个目标的内容
watch(threadId, () => {
  resetForm()
  void prepare()
})

onMounted(async () => {
  await nextTick()
  syncEditorScrollbars()
  await prepare()
})

onActivated(() => {
  if (!catalogLoaded.value) return

  void prepare()
})

onBeforeUnmount(destroyEditorScrollbars)
</script>

<style scoped lang="scss">
.thread-create {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.thread-create__meta {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.thread-create__meta--single {
  grid-template-columns: auto minmax(0, 1fr);
}

.thread-create__field {
  min-width: 0;
}

// 板块/子分类按内容宽度排，标题吃掉剩下的一行
.thread-create__field:not(.thread-create__field--title) {
  min-width: 116px;
}

.thread-create__hint {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  opacity: 0.6;
}

.thread-create__editor {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

:deep(.thread-create__editor .common),
:deep(.thread-create__editor .simple),
:deep(.thread-create__editor .md-editor) {
  height: 100%;
  min-height: 0;
}

:deep(.thread-create__editor .q-editor),
:deep(.thread-create__editor .md-editor) {
  height: 100% !important;
  min-height: 0;
  max-height: 100%;
}

// OverlayScrollbars 把滚动条挂在 .q-editor 下并且是 absolute 定位，
// q-editor 自身是 static，不给它 relative 滚动条就按视口定位，跑到窗口右边而不是编辑器里
:deep(.thread-create__editor .q-editor) {
  position: relative;
  display: flex;
  flex-direction: column;
}

:deep(.thread-create__editor .q-editor__content) {
  overflow: auto;
}

// md-editor 内部由 .cm-scroller / .md-editor-preview-wrapper 各自滚动，外层再给滚动就是第二根滚动条
:deep(.thread-create__editor .md-editor-content) {
  min-height: 0;
  overflow: hidden;
}

// 编辑器的正文样式来自 css/read（小说排版，段首缩进 2em），
// 社区帖子详情是 .thread-card__body p { text-indent: unset }，编辑时要跟它一致
:deep(.thread-create__editor .q-editor__content p),
:deep(.thread-create__editor .md-editor-preview p) {
  text-indent: unset;
}

@media (max-width: 959px) {
  .thread-create__meta {
    grid-template-columns: 1fr 1fr;
  }

  .thread-create__meta--single {
    grid-template-columns: 1fr;
  }

  .thread-create__field--title {
    grid-column: 1 / -1;
  }
}
</style>
