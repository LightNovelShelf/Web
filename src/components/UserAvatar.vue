<template>
  <span
    class="user-avatar"
    :class="{ 'user-avatar--disabled': disabled }"
    role="button"
    aria-haspopup="menu"
    :aria-label="`查看 ${user.UserName} 的资料`"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @mouseenter="openMenuSoon"
    @mouseleave="closeMenuSoon"
    @focus="openMenuSoon"
    @keydown.enter.space="toggleMenu"
    @click="toggleMenu"
  >
    <base-avatar :src="user.Avatar" :name="user.UserName" :size="size" />

    <q-menu
      v-if="!disabled"
      v-model="menuOpen"
      :viewport-padding="menuViewportPadding"
      no-parent-event
      :offset="menuOffset"
      :anchor="menuAnchor"
      :self="menuSelf"
      @before-show="loadSummary"
      @mouseenter="cancelClose"
      @mouseleave="closeMenuSoon"
    >
      <q-card class="user-summary">
        <q-card-section class="row items-center gap-12">
          <base-avatar :src="displayUser.Avatar" :name="displayUser.UserName" size="56px" />
          <div class="col">
            <div class="row items-center gap-8">
              <span class="text-subtitle1 text-weight-medium">{{ displayUser.UserName }}</span>
              <q-badge v-if="summary" outline color="primary">Lv{{ summary.Level }}</q-badge>
            </div>
            <div v-if="summary" class="text-caption text-grey-7">{{ summary.Role }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="loading" class="column gap-8">
          <q-skeleton type="text" />
          <q-skeleton type="text" width="70%" />
        </q-card-section>
        <q-card-section v-else-if="loadError" class="column items-center gap-8 text-grey-7">
          <span>{{ loadError }}</span>
          <q-btn flat dense color="primary" label="重试" @click.stop="loadSummary" />
        </q-card-section>
        <template v-else-if="summary">
          <q-card-section class="user-summary__stats">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <div class="text-subtitle1 text-weight-medium">{{ stat.value }}</div>
              <div class="text-caption text-grey-7">{{ stat.label }}</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="text-caption text-grey-7">
            加入于 <time-ago :value="summary.RegisterAt" />
          </q-card-section>
        </template>
      </q-card>
    </q-menu>
  </span>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import BaseAvatar from '@/components/BaseAvatar.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { getPublicUserSummary } from '@/services/user'

import type { PublicUserSummary } from '@/services/user/type'
import type { QMenuProps } from 'quasar'

interface UserAvatarData {
  Id: number
  UserName: string
  Avatar: string
}

const props = withDefaults(
  defineProps<{
    user: UserAvatarData
    size?: string
    disabled?: boolean
    menuAnchor?: QMenuProps['anchor']
    menuSelf?: QMenuProps['self']
    menuOffset?: readonly [number, number]
    menuViewportPadding?: readonly [number, number]
  }>(),
  {
    disabled: false,
    size: '40px',
    menuAnchor: 'bottom middle',
    menuSelf: 'top middle',
    menuOffset: () => [0, 8],
    menuViewportPadding: () => [8, 8],
  },
)

const menuOpen = ref(false)
const loading = ref(false)
const loadError = ref('')
const summary = ref<PublicUserSummary>()
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

const displayUser = computed(() => summary.value ?? props.user)
const stats = computed(() => {
  if (!summary.value) return []
  return [
    { label: '书籍', value: summary.value.BookCount },
    { label: '主题', value: summary.value.CommunityThreadCount },
    { label: '社区回复', value: summary.value.CommunityReplyCount },
    { label: '评论', value: summary.value.CommentCount },
  ]
})

async function loadSummary() {
  if (summary.value?.Id === props.user.Id || loading.value || props.user.Id <= 0) return

  loading.value = true
  loadError.value = ''
  try {
    summary.value = await getPublicUserSummary(props.user.Id)
  } catch (error) {
    loadError.value = getErrMsg(error)
  } finally {
    loading.value = false
  }
}

function cancelOpen() {
  clearTimeout(openTimer)
  openTimer = undefined
}

function cancelClose() {
  clearTimeout(closeTimer)
  closeTimer = undefined
}

function openMenuSoon() {
  if (props.disabled) return
  cancelClose()
  cancelOpen()
  openTimer = setTimeout(() => {
    menuOpen.value = true
  }, 180)
}

function closeMenuSoon() {
  cancelOpen()
  cancelClose()
  closeTimer = setTimeout(() => {
    menuOpen.value = false
  }, 180)
}

function toggleMenu(event: Event) {
  if (props.disabled) return
  event.preventDefault()
  event.stopPropagation()
  cancelOpen()
  cancelClose()
  menuOpen.value = !menuOpen.value
}

watch(
  () => [props.user.Id, props.disabled] as const,
  () => {
    menuOpen.value = false
    summary.value = undefined
    loadError.value = ''
  },
)

onBeforeUnmount(() => {
  cancelOpen()
  cancelClose()
})
</script>

<style lang="scss" scoped>
.user-avatar {
  display: inline-flex;
  cursor: pointer;
}

.user-avatar--disabled {
  cursor: default;
}

.user-summary {
  width: 320px;
  max-width: calc(100vw - 32px);
}

.user-summary__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
</style>
