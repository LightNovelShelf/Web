<template>
  <div class="comic-image-editor">
    <div class="comic-image-toolbar">
      <div>
        <div class="text-subtitle1">漫画图片</div>
        <div class="text-caption text-opacity">共 {{ items.length }} 页，可拖拽调整顺序</div>
        <div v-if="failedItems.length > 0" class="text-caption text-negative">
          {{ failedItems.length }} 张图片上传失败，重试或删除后才能保存
        </div>
      </div>
      <div class="comic-image-actions">
        <q-btn
          v-if="failedItems.length > 0"
          outline
          color="negative"
          icon="mdiRefresh"
          label="全部重试"
          :disable="uploading"
          @click="retryAll"
        />
        <q-btn color="secondary" label="添加图片" :disable="uploading" @click="pickImages" />
        <q-btn flat color="negative" label="清空" :disable="uploading || items.length === 0" @click="clearImages" />
      </div>
    </div>

    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" multiple @change="onFileChange" />

    <div v-if="uploading" class="upload-state">
      <q-linear-progress rounded :value="uploadProgress" color="secondary" />
      <div class="text-caption text-opacity">正在上传 {{ uploadedCount }} / {{ uploadTotal }}</div>
    </div>

    <q-banner v-if="items.length === 0" rounded class="bg-grey-2 text-grey-7">
      暂无图片，请按阅读顺序选择漫画图片。
    </q-banner>

    <Draggable
      v-else
      :model-value="items"
      item-key="key"
      :animation="150"
      class="comic-image-grid"
      ghost-class="comic-image-ghost"
      :disabled="uploading"
      @update:model-value="onReorder"
    >
      <template #item="{ element, index }">
        <q-card
          flat
          bordered
          class="comic-image-card"
          :class="{ 'comic-image-card--failed': element.status === 'failed' }"
        >
          <div class="comic-image-preview">
            <system-image
              v-if="element.status === 'done'"
              class="comic-image-thumbnail"
              :url="element.url"
              :request-height="256"
              fit="cover"
              loading="lazy"
              :alt="`第 ${index + 1} 页`"
              @click="previewImage(element.url, index)"
            />
            <q-img
              v-else
              class="comic-image-thumbnail"
              :src="element.url"
              fit="cover"
              :alt="`第 ${index + 1} 页`"
              @click="previewImage(element.url, index)"
            >
              <div class="absolute-full column flex-center gap-8">
                <q-spinner v-if="element.status === 'uploading'" size="32px" />
                <template v-else>
                  <q-icon name="mdiAlertCircleOutline" size="32px" color="negative" />
                  <div class="text-caption">上传失败</div>
                  <q-tooltip v-if="element.error">{{ element.error }}</q-tooltip>
                </template>
              </div>
            </q-img>
          </div>
          <q-card-section class="comic-image-meta">
            <div class="text-caption">第 {{ index + 1 }} 页</div>
            <div class="comic-image-buttons">
              <q-btn
                v-if="element.status === 'failed'"
                flat
                dense
                color="primary"
                label="重试"
                :disable="uploading"
                @click="retryItem(element)"
              />
              <q-btn flat dense color="negative" label="删除" :disable="uploading" @click="removeImage(index)" />
            </div>
          </q-card-section>
        </q-card>
      </template>
    </Draggable>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import Draggable from 'vuedraggable'

import SystemImage from '@/components/SystemImage.vue'

import { PROVIDE } from '@/const/provide'
import { uploadImage } from '@/services/user'

interface ComicImageItem {
  key: number
  status: 'done' | 'uploading' | 'failed'
  /** done 时为服务端地址，其余状态为本地 object URL */
  url: string
  file?: File
  error?: string
}

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  /** 存在上传中或上传失败的图片时为 true，此时 modelValue 不是完整的章节图片 */
  'update:pending': [value: boolean]
}>()

const $q = useQuasar()
const imagePreview = inject<{ show: (src: string, alt: string) => void }>(PROVIDE.IMAGE_PREVIEW)
const fileInputRef = ref<HTMLInputElement>()
const items = ref<ComicImageItem[]>([])
const uploadTotal = ref(0)
const uploadedCount = ref(0)
const fileNameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
let nextKey = 0
let lastEmitted: string[] | undefined

const failedItems = computed(() => items.value.filter((item) => item.status === 'failed'))
const uploading = computed(() => items.value.some((item) => item.status === 'uploading'))
const pending = computed(() => uploading.value || failedItems.value.length > 0)
const uploadProgress = computed(() => (uploadTotal.value === 0 ? 0 : uploadedCount.value / uploadTotal.value))

// 自己 emit 出去的数组回流时跳过，只有外部换了数组（如切换章节）才重建列表并丢弃未完成的图片
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined && toRaw(value) === lastEmitted) return
    releaseLocalImages(items.value)
    items.value = (value ?? []).map((url) => ({ key: nextKey++, status: 'done', url }))
  },
  { immediate: true },
)

watch(pending, (value) => emit('update:pending', value), { immediate: true })

onBeforeUnmount(() => {
  releaseLocalImages(items.value)
  if (pending.value) emit('update:pending', false)
})

function emitModel() {
  lastEmitted = items.value.filter((item) => item.status === 'done').map((item) => item.url)
  emit('update:modelValue', lastEmitted)
}

function releaseLocalImages(list: ComicImageItem[]) {
  for (const item of list) {
    if (item.status !== 'done') URL.revokeObjectURL(item.url)
  }
}

function pickImages() {
  fileInputRef.value?.click()
}

function previewImage(url: string, index: number) {
  imagePreview?.show(url, `第 ${index + 1} 页`)
}

function onReorder(value: ComicImageItem[]) {
  items.value = value
  emitModel()
}

function removeImage(index: number) {
  releaseLocalImages(items.value.slice(index, index + 1))
  items.value = items.value.filter((_, itemIndex) => itemIndex !== index)
  emitModel()
}

function clearImages() {
  $q.dialog({
    title: '清空图片',
    message: '确定移除本章的全部图片吗？保存章节后才会生效。',
    cancel: true,
  }).onOk(() => {
    releaseLocalImages(items.value)
    items.value = []
    emitModel()
  })
}

function retryItem(item: ComicImageItem) {
  void uploadItems([item])
}

function retryAll() {
  void uploadItems(failedItems.value)
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).sort((a, b) => fileNameCollator.compare(a.name, b.name))
  input.value = ''
  if (files.length === 0) return

  items.value.push(
    ...files.map((file): ComicImageItem => ({
      key: nextKey++,
      status: 'uploading',
      url: URL.createObjectURL(file),
      file,
    })),
  )
  // 取回响应式代理，上传过程中改状态才能触发渲染
  await uploadItems(items.value.slice(-files.length))
}

async function uploadItems(targets: ComicImageItem[]) {
  if (targets.length === 0) return
  for (const item of targets) {
    item.status = 'uploading'
    item.error = undefined
  }
  uploadTotal.value = targets.length
  uploadedCount.value = 0

  let cursor = 0
  const uploadWorker = async () => {
    while (cursor < targets.length) {
      const item = targets[cursor++]
      const file = item.file!
      try {
        const { Url } = await uploadImage({
          FileName: file.name,
          ImageData: new Uint8Array(await file.arrayBuffer()),
        })
        URL.revokeObjectURL(item.url)
        item.status = 'done'
        item.url = Url
        item.file = undefined
        if (items.value.includes(item)) emitModel()
      } catch (error) {
        item.status = 'failed'
        item.error = error instanceof Error ? error.message : String(error)
      } finally {
        uploadedCount.value += 1
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, targets.length) }, uploadWorker))

  const failedCount = targets.filter((item) => item.status === 'failed').length
  const successCount = targets.length - failedCount
  if (failedCount === 0) {
    $q.notify({ type: 'positive', message: `已上传 ${successCount} 张图片` })
  } else {
    $q.notify({
      type: 'warning',
      message: `成功 ${successCount} 张，失败 ${failedCount} 张`,
      caption: '失败的图片已保留在列表中，可点击重试',
      timeout: 5000,
    })
  }
}
</script>

<style lang="scss" scoped>
.comic-image-editor,
.upload-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comic-image-toolbar,
.comic-image-actions,
.comic-image-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comic-image-toolbar {
  justify-content: space-between;
}

.comic-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.comic-image-card {
  min-width: 0;
  cursor: grab;
  overflow: hidden;
}

.comic-image-card:active {
  cursor: grabbing;
}

.comic-image-card--failed {
  border-color: var(--q-negative);
}

.comic-image-preview {
  height: 210px;
  background: rgba(127, 127, 127, 0.12);
}

.comic-image-thumbnail {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.comic-image-meta {
  min-width: 0;
  justify-content: space-between;
  padding: 8px 8px 8px 12px;
}

.comic-image-meta > div {
  min-width: 0;
}

.comic-image-buttons {
  display: flex;
  flex-shrink: 0;
}

.comic-image-ghost {
  opacity: 0.35;
}

@media (max-width: 599px) {
  .comic-image-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .comic-image-actions {
    width: 100%;
  }

  .comic-image-actions .q-btn {
    flex: 1;
  }

  .comic-image-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .comic-image-preview {
    height: 180px;
  }
}
</style>
