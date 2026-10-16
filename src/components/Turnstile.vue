<template>
  <div class="column gap-4 q-my-sm">
    <div ref="container"></div>
    <div v-if="failure" class="row items-center gap-8 text-negative text-caption">
      <span>{{ failure }}</span>
      <q-btn flat dense size="sm" color="primary" label="重试" @click="retry" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { TURNSTILE_SITEKEY } from '@/const'

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      action: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const { action } = defineProps<{ action: string }>()
const token = defineModel<string>({ required: true })

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let turnstileLoader: Promise<TurnstileApi> | undefined

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  turnstileLoader ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    const fail = () => {
      turnstileLoader = undefined
      script.remove()
      reject(new Error('人机验证加载失败'))
    }
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : fail())
    script.onerror = fail
    document.head.appendChild(script)
  })
  return turnstileLoader
}

const container = ref<HTMLElement>()
const failure = ref('')
let widgetId: string | undefined
let unmounted = false

async function mount() {
  try {
    const turnstile = await loadTurnstile()
    if (unmounted || !container.value) return
    widgetId = turnstile.render(container.value, {
      sitekey: TURNSTILE_SITEKEY,
      action,
      callback: (value) => {
        failure.value = ''
        token.value = value
      },
      'expired-callback': () => (token.value = ''),
      'error-callback': () => {
        token.value = ''
        failure.value = '人机验证出错'
      },
    })
  } catch {
    if (!unmounted) failure.value = '人机验证加载失败'
  }
}

function reset() {
  token.value = ''
  if (widgetId !== undefined) window.turnstile?.reset(widgetId)
}

function retry() {
  failure.value = ''
  if (widgetId === undefined) void mount()
  else reset()
}

onMounted(mount)

onBeforeUnmount(() => {
  unmounted = true
  if (widgetId !== undefined) window.turnstile?.remove(widgetId)
  widgetId = undefined
})

defineExpose({ reset })
</script>
