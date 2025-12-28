<template>
  <q-input
    :label="label"
    placeholder="https://"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @paste="onPaste"
    :rules="rules"
  >
    <template v-slot:append>
      <q-icon name="mdiImage" @click="pickImage" class="cursor-pointer" />
    </template>
  </q-input>
  <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'

import { uploadImage } from 'src/services/user'

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    rules?: any[]
  }>(),
  {
    label: '封面地址',
  },
)

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const fileInputRef = ref<HTMLInputElement>()

const pickImage = () => {
  fileInputRef.value?.click()
}

const handleUpload = async (file: File) => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: '上传中...',
  })

  try {
    const url = await uploadImage({ FileName: file.name, ImageData: new Uint8Array(await file.arrayBuffer()) })
    emit('update:modelValue', url)
    notif({
      icon: 'mdiCheck',
      spinner: false,
      message: '上传完成',
      timeout: 1000,
    })
  } catch (error) {
    notif({
      type: 'negative',
      message: '上传失败',
      timeout: 2000,
    })
  }
}

const onFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  await handleUpload(files[0])
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const onPaste = async (evt: ClipboardEvent) => {
  const files = evt.clipboardData?.files
  if (files && files.length > 0) {
    evt.preventDefault()
    await handleUpload(files[0])
  }
}
</script>
