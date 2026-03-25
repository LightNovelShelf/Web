<template>
  <section class="composer">
    <div class="composer__copy">
      <div class="composer__eyebrow">Publish</div>
      <div class="composer__title">发布帖子</div>
    </div>

    <div v-if="user" class="composer__actions">
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="mdiSquareEditOutline"
        label="打开发帖弹框"
        @click="dialogOpen = true"
      />
    </div>

    <div v-else class="composer__actions">
      <div class="composer__hint">登录后可发布新帖并进入详情页继续讨论。</div>
      <q-btn unelevated no-caps color="primary" label="登录后参与讨论" />
    </div>

    <q-dialog v-model="dialogOpen" persistent transition-show="fade" transition-hide="fade">
      <q-card class="composer-dialog">
        <div class="composer-dialog__header">
          <div>
            <div class="composer-dialog__eyebrow">Create Thread</div>
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
            <q-select
              v-model="boardKey"
              outlined
              emit-value
              map-options
              label="板块"
              :options="boardOptions"
            />

            <q-input
              v-model="title"
              outlined
              maxlength="60"
              counter
              label="标题"
              placeholder="先把这一帖的核心问题或观点写清楚"
            />
          </div>

          <div class="composer-dialog__editor">
            <div class="composer-dialog__editor-label">内容</div>
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
              :disable="!canSubmit"
              @click="submit"
            />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import sanitizerHtml from 'src/utils/sanitizeHtml'

import HtmlEditor from 'components/html/HtmlEditor.vue'

import type { CommunityBoardKey, CreateCommunityThreadRequest } from 'src/services/forum/types'

const props = defineProps<{
  user: any
  selectedBoardKey: CommunityBoardKey
}>()

const emit = defineEmits<{
  create: [payload: Omit<CreateCommunityThreadRequest, 'authorName'>]
}>()

const dialogOpen = ref(false)
const title = ref('')
const contentHtml = ref('<p></p>')
const boardKey = ref<Exclude<CommunityBoardKey, 'all'>>('anime')

const boardOptions = [
  { label: '动画', value: 'anime' },
  { label: '漫画', value: 'comic' },
  { label: '游戏', value: 'game' },
  { label: '小说', value: 'novel' },
  { label: '站务', value: 'website' },
] as const

const plainText = computed(() => getPlainTextFromHtml(contentHtml.value))
const plainTextLength = computed(() => plainText.value.replace(/\s+/g, '').length)
const canSubmit = computed(() => title.value.trim().length >= 6 && plainTextLength.value >= 20)

watch(
  () => props.selectedBoardKey,
  (nextBoardKey) => {
    if (nextBoardKey && nextBoardKey !== 'all') {
      boardKey.value = nextBoardKey
    }
  },
  { immediate: true },
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

function handleClose() {
  dialogOpen.value = false
  resetForm()
}

function submit() {
  if (!canSubmit.value) {
    return
  }

  emit('create', {
    boardKey: boardKey.value,
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.08);
}

.composer__eyebrow,
.composer-dialog__eyebrow {
  color: var(--community-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.composer__title {
  margin-top: 8px;
  color: var(--community-text);
  font-size: 24px;
  font-weight: 700;
}

.composer__actions,
.composer-dialog__footer,
.composer-dialog__footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.composer__actions {
  justify-content: flex-end;
}

.composer-dialog {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(1100px, calc(100vw - 48px));
  max-width: 1100px;
  height: min(860px, calc(100vh - 48px));
  margin: auto;
  border-radius: 30px;
  overflow: hidden;
  background: linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%);
}

.composer-dialog__header,
.composer-dialog__footer {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.92);
}

.composer-dialog__header {
  position: relative;
  padding-right: 72px;
}

.composer-dialog__footer {
  border-top: 1px solid rgba(226, 232, 240, 0.92);
  border-bottom: 0;
  justify-content: flex-end;
}

.composer-dialog__title {
  margin: 8px 0 0;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.1;
}

.composer-dialog__body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 18px;
  padding: 20px 24px 24px;
  min-height: 0;
  overflow: hidden;
}

.composer-dialog__meta {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 12px;
}

.composer-dialog__editor {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.composer-dialog__editor-label {
  margin-bottom: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.composer-dialog__editor-shell {
  flex: 1 1 auto;
  min-height: 0;
  height: min(460px, calc(100vh - 340px));
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
  .composer-dialog__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer-dialog {
    width: 100vw;
    height: 100vh;
    max-width: none;
    border-radius: 0;
  }

  .composer-dialog__header {
    padding-right: 68px;
  }

  .composer-dialog__meta {
    grid-template-columns: 1fr;
  }

  .composer-dialog__editor-shell {
    height: min(52vh, calc(100vh - 300px));
  }
}
</style>
