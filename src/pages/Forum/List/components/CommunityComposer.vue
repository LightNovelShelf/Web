<template>
  <section class="composer">
    <div class="composer__copy">
      <div class="composer__title">发布帖子</div>
      <div class="composer__hint">先把核心观点写出来，再进详情页继续展开讨论。</div>
    </div>

    <div class="composer__actions">
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="mdiSquareEditOutline"
        label="发布帖子"
        :disable="!ready || submitting"
        :loading="submitting"
        @click="handlePrimaryAction"
      />
    </div>

    <q-dialog v-model="dialogOpen" persistent transition-show="fade" transition-hide="fade">
      <q-card flat bordered class="composer-dialog" :style="dialogCardStyle">
        <div class="composer-dialog__header">
          <div>
            <h2 class="composer-dialog__title">发布新帖子</h2>
          </div>

          <q-btn
            class="composer-dialog__close"
            flat
            round
            dense
            icon="mdiClose"
            aria-label="关闭发帖弹框"
            @click="handleClose"
          />
        </div>

        <div class="composer-dialog__body">
          <div class="composer-dialog__meta">
            <div class="composer-dialog__meta-row">
              <q-select
                v-model="boardKey"
                class="composer-dialog__field"
                dense
                outlined
                emit-value
                map-options
                label="板块"
                :options="boardOptions"
              />

              <q-select
                v-if="subCategoryOptions.length"
                v-model="subCategoryKey"
                class="composer-dialog__field"
                dense
                outlined
                emit-value
                map-options
                label="子分类"
                :options="subCategoryOptions"
              />
            </div>

            <q-input
              v-model="title"
              class="composer-dialog__field composer-dialog__field--title"
              outlined
              maxlength="60"
              label="标题"
              placeholder="先把这一帖的核心问题或观点写清楚"
            />
          </div>

          <div class="composer-dialog__editor">
            <div class="composer-dialog__editor-row">
              <div class="composer-dialog__editor-label">内容</div>
              <div class="composer-dialog__editor-hint">标题至少 6 个字，正文至少 20 个字。</div>
            </div>
            <div class="composer-dialog__editor-shell">
              <html-editor v-if="dialogOpen" v-model:html="contentHtml" mode="common" />
            </div>
          </div>
        </div>

        <div class="composer-dialog__footer">
          <div class="composer-dialog__footer-actions">
            <q-btn flat no-caps color="grey-7" label="取消" @click="handleClose" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="mdiSend"
              label="发布帖子"
              :disable="!canSubmit || submitting"
              :loading="submitting"
              @click="submit"
            />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

import sanitizerHtml from 'src/utils/sanitizeHtml'

import HtmlEditor from 'components/html/HtmlEditor.vue'

import type { CommunityBoardKey, CommunityCatalogBoard, CreateCommunityThreadRequest } from 'src/services/forum'

const props = defineProps<{
  user: any
  ready: boolean
  catalogBoards: CommunityCatalogBoard[]
  selectedBoardKey: CommunityBoardKey
  selectedSubCategoryKey: string
  submitting: boolean
}>()

const emit = defineEmits<{
  create: [payload: Omit<CreateCommunityThreadRequest, 'authorName'>]
}>()

const $q = useQuasar()
const route = useRoute()
const dialogOpen = ref(false)
const title = ref('')
const contentHtml = ref('<p></p>')
const boardKey = ref<Exclude<CommunityBoardKey, 'all'>>('')
const subCategoryKey = ref('')

const catalogBoardMap = computed(() => new Map(props.catalogBoards.map((item) => [item.Key, item])))
const defaultBoardKey = computed(() => props.catalogBoards[0]?.Key ?? '')

const boardOptions = computed(() =>
  props.catalogBoards.map((item) => ({
    label: item.Title,
    value: item.Key,
  })),
)

const subCategoryOptions = computed(() =>
  (catalogBoardMap.value.get(boardKey.value)?.SubCategories ?? []).map((item) => ({
    label: item.Label,
    value: item.Key,
  })),
)

const plainText = computed(() => getPlainTextFromHtml(contentHtml.value))
const plainTextLength = computed(() => plainText.value.replace(/\s+/g, '').length)
const canSubmit = computed(() => !!boardKey.value && title.value.trim().length >= 6 && plainTextLength.value >= 20)
const dialogCardStyle = computed(() => ({
  '--community-dialog-bg': $q.dark.isActive
    ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94))'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96))',
  '--community-dialog-border': $q.dark.isActive ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.18)',
  '--community-dialog-text': $q.dark.isActive ? '#e2e8f0' : '#0f172a',
  '--community-dialog-text-soft': $q.dark.isActive ? '#94a3b8' : '#64748b',
  color: $q.dark.isActive ? '#e2e8f0' : '#0f172a',
}))

function syncBoardFromProps() {
  boardKey.value =
    props.selectedBoardKey && props.selectedBoardKey !== 'all' && catalogBoardMap.value.has(props.selectedBoardKey)
      ? props.selectedBoardKey
      : defaultBoardKey.value
  syncSubCategoryForBoard()
}

function syncSubCategoryForBoard() {
  const matched = subCategoryOptions.value.find((item) => item.value === props.selectedSubCategoryKey)
  subCategoryKey.value = (matched?.value as string) ?? (subCategoryOptions.value[0]?.value as string) ?? ''
}

watch(
  () => dialogOpen.value,
  (open) => {
    if (open) {
      syncBoardFromProps()
    }
  },
)

watch(
  () => [props.selectedBoardKey, props.selectedSubCategoryKey].join(':'),
  () => {
    if (!dialogOpen.value) {
      syncBoardFromProps()
    }
  },
  { immediate: true },
)

watch(boardKey, () => {
  syncSubCategoryForBoard()
})

watch(
  () => props.catalogBoards.map((item) => item.Key).join(':'),
  () => {
    if (!catalogBoardMap.value.has(boardKey.value)) {
      syncBoardFromProps()
    }
  },
  { immediate: true },
)

watch(
  () => props.submitting,
  (nextSubmitting) => {
    if (!nextSubmitting && dialogOpen.value && !title.value && plainTextLength.value === 0) {
      dialogOpen.value = false
    }
  },
)

function getPlainTextFromHtml(html: string) {
  const div = document.createElement('div')
  div.innerHTML = sanitizerHtml(html)
  const text = div.textContent?.trim() ?? ''
  div.remove()
  return text
}

function resetForm() {
  title.value = ''
  contentHtml.value = '<p></p>'
}

function handlePrimaryAction() {
  if (!props.ready || props.submitting) {
    return
  }

  dialogOpen.value = true
}

function handleClose() {
  if (props.submitting) {
    return
  }

  dialogOpen.value = false
  resetForm()
}

function submit() {
  if (!canSubmit.value || props.submitting) {
    return
  }

  emit('create', {
    boardKey: boardKey.value,
    subCategoryKey: subCategoryKey.value || undefined,
    title: title.value.trim(),
    contentHtml: contentHtml.value,
  })

  dialogOpen.value = false
  resetForm()
}
</script>

<style scoped lang="scss">
.composer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px;
  border: 1px solid var(--community-border);
  border-radius: 28px;
  background: var(--community-card-bg);
  box-shadow: var(--community-shadow);
}

.composer__title {
  color: var(--community-text);
  font-size: 24px;
  font-weight: 700;
}

.composer__hint,
.composer-dialog__editor-hint {
  margin-top: 8px;
  color: var(--community-text-soft);
  font-size: 12px;
}

.composer__actions,
.composer-dialog__footer,
.composer-dialog__footer-actions,
.composer-dialog__editor-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.composer__actions {
  justify-content: flex-end;
  margin-left: auto;
}

.composer-dialog {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(1100px, 96vw);
  max-width: 1100px;
  height: 92vh;
  min-height: 720px;
  max-height: 860px;
  margin: auto;
  border-radius: 30px;
  overflow: hidden;
  background: var(--community-dialog-bg);
}

.composer-dialog__header,
.composer-dialog__footer {
  padding: 20px 24px;
  border-bottom: 1px solid var(--community-dialog-border);
}

.composer-dialog__header {
  position: relative;
  padding-right: 72px;
}

.composer-dialog__footer {
  border-top: 1px solid var(--community-dialog-border);
  border-bottom: 0;
  justify-content: flex-end;
}

.composer-dialog__title {
  margin: 0;
  color: var(--community-dialog-text);
  font-size: 28px;
  line-height: 1.1;
}

.composer-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 24px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.composer-dialog__meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer-dialog__meta-row {
  display: grid;
  grid-template-columns: minmax(150px, 170px) minmax(150px, 170px);
  gap: 12px;
  align-items: start;
}

.composer-dialog__field {
  width: 100%;
  min-width: 0;
}

.composer-dialog__field--title {
  max-width: 100%;
}

.composer-dialog__editor {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.composer-dialog__editor-row {
  justify-content: space-between;
  margin-bottom: 10px;
}

.composer-dialog__editor-label {
  color: var(--community-dialog-text-soft);
  font-size: 13px;
  font-weight: 700;
}

.composer-dialog__editor-shell {
  flex: 1 1 auto;
  overflow: hidden;
}

.composer-dialog__close {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 1;
}

:deep(.composer-dialog__editor-shell .common),
:deep(.composer-dialog__editor-shell .simple),
:deep(.composer-dialog__editor-shell .html-editor),
:deep(.composer-dialog__editor-shell .md-editor) {
  min-height: 0;
  height: 100%;
}

:deep(.composer-dialog__editor-shell .q-editor),
:deep(.composer-dialog__editor-shell .md-editor) {
  min-height: 0;
  height: 100% !important;
  max-height: 100%;
}

:deep(.composer-dialog__editor-shell .q-editor) {
  display: flex;
  flex-direction: column;
}

:deep(.composer-dialog__editor-shell .q-editor__content),
:deep(.composer-dialog__editor-shell .md-editor-content) {
  overflow: auto;
}

@media (max-width: 900px) {
  .composer,
  .composer__actions,
  .composer-dialog__footer,
  .composer-dialog__editor-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer-dialog {
    width: 100vw;
    height: 100vh;
    min-height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }

  .composer-dialog__header {
    padding-right: 68px;
  }

  .composer-dialog__meta {
    gap: 10px;
  }

  .composer-dialog__meta-row {
    grid-template-columns: 1fr;
  }
}
</style>
