<template>
  <div ref="box" />
</template>

<script setup>
const props = defineProps({ modelValue: String })
const emits = defineEmits(['update:modelValue'])

const loaded = ref(!!window.turnstile)
const widgetId = ref()
const box = ref()

function render() {
  widgetId.value = window.turnstile.render(box.value, {
    sitekey: VUE_CAPTCHA_SITE_KEY,
    callback: (response) => emits('update:modelValue', response),
    'expired-callback': emits('update:modelValue', null),
    'error-callback': emits('update:modelValue', null)
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
