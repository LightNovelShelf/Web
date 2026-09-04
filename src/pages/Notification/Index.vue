<template>
  <q-page padding>
    <div class="notification-page">
      <!-- 标题栏 -->
      <div class="q-mb-md">
        <div class="text-h5 text-weight-medium q-mb-sm">通知中心</div>
        <q-separator />
      </div>

      <!-- 通知列表 -->
      <q-infinite-scroll @load="onLoad" :offset="250" ref="infiniteScroll">
        <div class="notification-list">
          <q-card
            v-for="notification in notifications"
            :key="notification.Id"
            class="notification-item q-mb-sm"
            flat
            bordered
            :class="{ unread: !notification.IsRead, actionable: supportsNotificationAction(notification.Action) }"
            @click="handleNotificationClick(notification)"
          >
            <q-card-section horizontal>
              <!-- 用户头像 -->
              <user-avatar v-if="notification.Actor" class="q-mr-md" :user="notification.Actor" size="48px" />
              <q-avatar v-else size="48px" class="q-mr-md">
                <q-icon
                  :name="notificationTonePresentation(notification.Tone).icon"
                  size="48px"
                  :color="notificationTonePresentation(notification.Tone).color"
                />
              </q-avatar>

              <!-- 通知内容 -->
              <div class="notification-content flex-1">
                <div class="notification-header row items-center q-mb-xs">
                  <span class="text-weight-medium">{{ notification.Actor?.UserName || '系统' }}</span>
                  <q-space />
                  <time-ago class="text-grey-6 text-caption" :value="notification.CreatedAt" />
                </div>

                <div class="notification-preview-container">
                  <div
                    class="notification-preview q-pa-sm bg-grey-2 rounded-borders"
                    :class="notificationTonePresentation(notification.Tone).borderClass"
                  >
                    <div class="text-weight-medium text-grey-9 q-mb-xs">
                      {{ notification.Title }}
                    </div>
                    <div v-if="notification.Body" class="text-body2 text-grey-8">
                      {{ notification.Body }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 未读标记 -->
              <div v-if="!notification.IsRead" class="unread-dot"></div>
            </q-card-section>
          </q-card>
        </div>

        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>

      <!-- 空状态 -->
      <div v-if="notifications.length === 0 && !loading" class="empty-state text-center q-pa-xl">
        <q-icon name="mdiEmailOutline" size="64px" color="grey-5" />
        <div class="text-grey-6 q-mt-md">暂无通知</div>
      </div>

      <!-- 底部操作按钮 -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn v-if="unreadIds.length > 0" round color="primary" icon="mdiCheckAll" @click="markAllAsRead">
          <q-tooltip>全部标记为已读</q-tooltip>
        </q-btn>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useSessionStore } from '@/stores/session'

import TimeAgo from '@/components/TimeAgo.vue'
import UserAvatar from '@/components/UserAvatar.vue'

import { useInitRequest } from '@/composition/biz/useInitRequest'

import { getNotifications, markNotifications } from '@/services/user'

import { executeNotificationAction, supportsNotificationAction } from './actions'
import { notificationTonePresentation } from './presentation'

import type { GetNotifications } from '@/services/user/type'

const router = useRouter()
const appStore = useSessionStore()
const notifications = ref<GetNotifications.Notification[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = 20
const loading = ref(false)
const infiniteScroll = ref()

const unreadIds = computed(() => {
  return notifications.value.filter((n) => !n.IsRead).map((n) => n.Id)
})

const refreshUnreadCount = async () => {
  if (!appStore.user) {
    return
  }

  try {
    await appStore.refreshUser()
  } catch {
    // 保持通知页主流程可用，badge 刷新失败不阻断跳转
  }
}

// 加载通知列表
const loadNotifications = async (page: number) => {
  loading.value = true
  try {
    const result = await getNotifications({
      Page: page,
      Size: pageSize,
    })
    return result
  } finally {
    loading.value = false
  }
}

// 滚动加载
const onLoad = async (index: number, done: () => void) => {
  const result = await loadNotifications(index)

  if (index === 1) {
    // 第一次加载，直接设置数据
    notifications.value = result.Data
  } else {
    // 后续加载，追加数据
    notifications.value.push(...result.Data)
  }

  currentPage.value = result.Page
  totalPages.value = result.TotalPages

  if (index >= totalPages.value) {
    infiniteScroll.value?.stop()
  }

  done()
}

const requestNotifications = async () => {
  notifications.value = []
  currentPage.value = 1
  totalPages.value = 0

  infiniteScroll.value?.reset()
  infiniteScroll.value?.resume()
  infiniteScroll.value?.trigger()

  await refreshUnreadCount()
  await nextTick()
}

// 点击通知
const handleNotificationClick = async (notification: GetNotifications.Notification) => {
  // 根据已读状态动态调用标记API
  if (!notification.IsRead) {
    try {
      await markNotifications({ Ids: [notification.Id] })
      notification.IsRead = true
      await refreshUnreadCount()
    } catch (error) {
      // 标记失败不影响跳转，静默处理
    }
  }

  await executeNotificationAction(router, notification.Action)
}

// 全部标记为已读
const markAllAsRead = async () => {
  if (unreadIds.value.length === 0) return

  await markNotifications({ Ids: unreadIds.value })

  // 更新本地状态
  notifications.value.forEach((n) => {
    if (!n.IsRead) {
      n.IsRead = true
    }
  })

  await refreshUnreadCount()
}

useInitRequest(requestNotifications)
</script>

<style scoped lang="scss">
.notification-page {
  max-width: 900px;
  margin: 0 auto;
}

.notification-item {
  cursor: default;
  transition: all 0.2s;
  position: relative;

  &.unread {
    background-color: rgba(33, 150, 243, 0.04);
  }

  &.actionable {
    cursor: pointer;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
  }
}

.notification-content {
  min-width: 0;
  flex: 1;
}

.notification-preview {
  border-left: 3px solid #9e9e9e;
  font-size: 13px;
  line-height: 1.5;

  &--info {
    border-left-color: #2196f3;
  }

  &--success {
    border-left-color: #21ba45;
  }

  &--warning {
    border-left-color: #f2c037;
  }

  &--danger {
    border-left-color: #c10015;
  }
}

.unread-dot {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background-color: #2196f3;
  border-radius: 50%;
}

.empty-state {
  padding-top: 100px;
}
</style>
