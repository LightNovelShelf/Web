<template>
  <div ref="telegram"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator(value) {
      return ['callback', 'redirect'].includes(value)
    }
  },
  telegramLogin: {
    type: String,
    required: true,
    validator(value) {
      return value.endsWith('bot') || value.endsWith('Bot')
    }
  },
  redirectUrl: {
    type: String,
    default: ''
  },
  requestAccess: {
    type: String,
    default: 'read',
    validator(value) {
      return ['read', 'write'].includes(value)
    }
  },
  size: {
    type: String,
    default: 'large',
    validator(value) {
      return ['small', 'medium', 'large'].includes(value)
    }
  },
  userpic: {
    type: Boolean,
    default: true
  },
  radius: {
    type: String
  }
})

const emit = defineEmits(['callback', 'loaded'])
function onTelegramAuth(user) {
  emit('callback', user)
}

const telegram = ref(null)
const script = document.createElement('script')
script.async = true
script.src = 'https://telegram.org/js/telegram-widget.js?19'

script.setAttribute('data-size', props.size)
script.setAttribute('data-userpic', props.userpic)
script.setAttribute('data-telegram-login', props.telegramLogin)
script.setAttribute('data-request-access', props.requestAccess)

script.onload = () => {
  emit('loaded')
}

if (props.radius) script.setAttribute('data-radius', props.radius)

if (props.mode === 'callback') {
  window.onTelegramAuth = onTelegramAuth
  script.setAttribute('data-onauth', 'window.onTelegramAuth(user)')
} else {
  script.setAttribute('data-auth-url', props.redirectUrl)
}

onMounted(() => {
  telegram.value.appendChild(script)
})
</script>
