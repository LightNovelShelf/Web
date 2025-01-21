<template>
  <div ref="box" />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: String,
  theme: String as PropType<'light' | 'dark' | 'auto'>,
  size: String as PropType<'normal' | 'flexible' | 'compact'>,
})
const emits = defineEmits(['update:modelValue', 'passed'])

const loaded = ref(!!window.turnstile)
const widgetId = ref()
const box = ref()

function render() {
  widgetId.value = window.turnstile.render(box.value, {
    sitekey: process.env.VUE_CAPTCHA_SITE_KEY,
    callback: (response: any) => {
      emits('passed')
      emits('update:modelValue', response)
    },
    'expired-callback': () => {
      emits('passed')
      emits('update:modelValue', null)
    },
    'error-callback': () => {
      emits('passed')
      emits('update:modelValue', null)
    },
    'unsupported-callback': () => {
      emits('passed')
      emits('update:modelValue', null)
    },
    'timeout-callback': () => {
      emits('passed')
      emits('update:modelValue', null)
    },
    theme: props.theme ?? 'auto',
    size: props.size ?? 'flexible',
  })
}

onMounted(() => {
  if (window.turnstile) {
    render()
  } else {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    window.onloadTurnstileCallback = () => {
      loaded.value = true
      render()
    }
  }
})

const reset = () => window.turnstile?.reset(widgetId.value)

defineExpose({ loaded, reset })
</script>

<style scoped></style>
