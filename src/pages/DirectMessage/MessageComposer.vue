<template>
  <div class="message-composer">
    <q-input
      v-model="content"
      class="message-composer__input"
      type="textarea"
      dense
      outlined
      autogrow
      :placeholder="placeholder"
      :input-style="{ maxHeight: '160px' }"
      @keydown.enter="onEnter"
    />

    <div class="message-composer__actions">
      <div class="text-caption" :class="overLimit ? 'text-negative' : 'text-opacity'">{{ length }}/{{ MAX_LENGTH }}</div>
      <q-btn dense unelevated color="primary" icon="mdiSend" label="发送" :disable="!canSubmit" @click="submit" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: 'Enter 发送，Shift + Enter 换行',
})

const emit = defineEmits<{ send: [content: string] }>()

const MAX_LENGTH = 2000

const content = ref('')

// 后端按 Unicode 标量值计数，不能用 String.length
const length = computed(() => Array.from(content.value).length)
const overLimit = computed(() => length.value > MAX_LENGTH)
const canSubmit = computed(() => content.value.trim().length > 0 && !overLimit.value)

function submit() {
  if (!canSubmit.value) return

  const text = content.value
  // 先清空再抛出，发送期间输入框保持可用，允许连续发
  content.value = ''
  emit('send', text)
}

function onEnter(event: KeyboardEvent) {
  // 输入法组字过程中的 Enter 是确认候选词，不是发送
  if (event.isComposing || event.shiftKey) return

  event.preventDefault()
  submit()
}
</script>

<style scoped lang="scss">
.message-composer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-composer__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
</style>
