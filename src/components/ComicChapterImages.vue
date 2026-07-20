<template>
  <div class="comic-image-editor">
    <div class="comic-image-toolbar">
      <div>
        <div class="text-subtitle1">漫画图片</div>
        <div class="text-caption text-opacity">共 {{ images.length }} 页，可拖拽调整顺序</div>
      </div>
      <div class="comic-image-actions">
        <q-btn color="secondary" label="添加图片" :disable="uploading" @click="pickImages" />
        <q-btn flat color="negative" label="清空" :disable="uploading || images.length === 0" @click="clearImages" />
      </div>
    </div>

    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" multiple @change="onFileChange" />

    <div v-if="uploading" class="upload-state">
      <q-linear-progress rounded :value="uploadProgress" color="secondary" />
      <div class="text-caption text-opacity">正在上传 {{ uploadedCount }} / {{ uploadTotal }}</div>
    </div>

    <q-banner v-if="images.length === 0 && !uploading" rounded class="bg-grey-2 text-grey-7">
      暂无图片，请按阅读顺序选择漫画图片。
    </q-banner>

    <Draggable
      v-else
      v-model="images"
      :item-key="imageKey"
      :animation="150"
      class="comic-image-grid"
      ghost-class="comic-image-ghost"
      :disabled="uploading"
      @change="handleOrderChange"
    >
      <template #item="{ element, index }">
        <q-card flat bordered class="comic-image-card">
          <div class="comic-image-preview">
            <img
              :src="previewFor(index)"
              :alt="`第 ${index + 1} 页`"
              loading="lazy"
              @click="previewImage(element, index)"
            />
          </div>
          <q-card-section class="comic-image-meta">
            <div class="text-caption">第 {{ index + 1 }} 页</div>
            <q-btn flat dense color="negative" label="删除" :disable="uploading" @click="removeImage(index)" />
          </q-card-section>
        </q-card>
      </template>
    </Draggable>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import Draggable from 'vuedraggable'

import { PROVIDE } from 'src/const/provide'
import { uploadImage } from 'src/services/user'

const props = defineProps<{
  modelValue: string[]
  previews: string[]
  uploading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'update:previews': [value: string[]]
  'update:uploading': [value: boolean]
}>()

const $q = useQuasar()
const imagePreview = inject<{ show: (src: string, alt: string) => void }>(PROVIDE.IMAGE_PREVIEW)
const fileInputRef = ref<HTMLInputElement>()
const uploadTotal = ref(0)
const uploadedCount = ref(0)
const fileNameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const images = computed({
  get: () => props.modelValue ?? [],
  set: (value: string[]) => emit('update:modelValue', value),
})
const previews = computed({
  get: () => props.previews ?? [],
  set: (value: string[]) => emit('update:previews', value),
})
const uploading = computed(() => props.uploading ?? false)
const uploadProgress = computed(() => (uploadTotal.value === 0 ? 0 : uploadedCount.value / uploadTotal.value))

function pickImages() {
  fileInputRef.value?.click()
}

function imageKey(url: string) {
  return url
}

function previewFor(index: number) {
  return previews.value[index] || images.value[index]
}

function previewImage(url: string, index: number) {
  imagePreview?.show(url, `第 ${index + 1} 页`)
}

function removeImage(index: number) {
  images.value = images.value.filter((_, imageIndex) => imageIndex !== index)
  previews.value = previews.value.filter((_, imageIndex) => imageIndex !== index)
}

function handleOrderChange(event: { moved?: { oldIndex: number; newIndex: number } }) {
  if (!event.moved) return
  const reorderedPreviews = [...previews.value]
  const [movedPreview] = reorderedPreviews.splice(event.moved.oldIndex, 1)
  reorderedPreviews.splice(event.moved.newIndex, 0, movedPreview)
  previews.value = reorderedPreviews
}

function clearImages() {
  $q.dialog({
    title: '清空图片',
    message: '确定移除本章的全部图片吗？保存章节后才会生效。',
    cancel: true,
  }).onOk(() => {
    images.value = []
    previews.value = []
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).sort((a, b) => fileNameCollator.compare(a.name, b.name))
  if (files.length === 0) return

  emit('update:uploading', true)
  uploadTotal.value = files.length
  uploadedCount.value = 0

  const uploadedImages = new Array<{ Url: string; MediumUrl: string } | undefined>(files.length)
  const failedFiles: string[] = []
  let cursor = 0

  const uploadWorker = async () => {
    while (cursor < files.length) {
      const index = cursor++
      const file = files[index]
      try {
        uploadedImages[index] = await uploadImage({
          FileName: file.name,
          ImageData: new Uint8Array(await file.arrayBuffer()),
        })
      } catch {
        failedFiles.push(file.name)
      } finally {
        uploadedCount.value += 1
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(3, files.length) }, uploadWorker))
    const successfulImages = uploadedImages.filter(
      (image): image is { Url: string; MediumUrl: string } => Boolean(image),
    )
    images.value = [...images.value, ...successfulImages.map((image) => image.Url)]
    previews.value = [...previews.value, ...successfulImages.map((image) => image.MediumUrl)]

    if (failedFiles.length === 0) {
      $q.notify({ type: 'positive', message: `已上传 ${successfulImages.length} 张图片` })
    } else {
      $q.notify({
        type: 'warning',
        message: `成功 ${successfulImages.length} 张，失败 ${failedFiles.length} 张`,
        caption: failedFiles.join('、'),
        timeout: 5000,
      })
    }
  } finally {
    emit('update:uploading', false)
    input.value = ''
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

.comic-image-preview {
  height: 210px;
  background: rgba(127, 127, 127, 0.12);
}

.comic-image-preview img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
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
