<template>
  <q-page padding>
    <div class="notification-page">
      <!-- 标题栏 -->
      <div class="q-mb-md">
        <div class="text-h5 text-weight-medium q-mb-sm">消息中心</div>
        <q-separator />
      </div>

      <!-- 消息列表 -->
      <q-infinite-scroll @load="onLoad" :offset="250" ref="infiniteScroll">
        <div class="notification-list">
          <q-card
            v-for="notification in notifications"
            :key="notification.Id"
            class="notification-item q-mb-sm"
            flat
            bordered
            :class="{ unread: !notification.IsRead }"
            @click="handleNotificationClick(notification)"
          >
            <q-card-section horizontal>
              <!-- 用户头像 -->
              <q-avatar size="48px" class="q-mr-md">
                <img v-if="notification.Actor?.Avatar" :src="notification.Actor.Avatar" />
                <q-icon v-else name="mdiAccountCircle" size="48px" color="grey-5" />
              </q-avatar>

              <!-- 消息内容 -->
              <div class="notification-content flex-1">
                <div class="notification-header row items-center q-mb-xs">
                  <span class="text-weight-medium">{{ notification.Actor?.UserName || '系统' }}</span>
                  <span class="text-grey-7 q-ml-xs">
                    {{ getNotificationLabel(notification) }}
                  </span>
                  <q-space />
                  <span class="text-grey-6 text-caption">{{ formatTime(notification.CreatedAt) }}</span>
                </div>

                <div v-if="notification.Extra" class="notification-preview-container">
                  <div class="notification-preview q-pa-sm bg-grey-2 rounded-borders">
                    <div v-if="notification.Extra.object_title" class="text-caption text-grey-7 q-mb-xs">
                      《{{ notification.Extra.object_title }}》
                    </div>
                    <div
                      v-if="notification.Extra.reply_preview"
                      class="notification-preview__reply q-mb-xs text-body2 text-grey-7"
                    >
                      回复：{{ notification.Extra.reply_preview }}
                    </div>
                    <div v-if="notification.Extra.preview" class="text-body2 text-grey-8">
                      {{ notification.Extra.preview }}
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
        <div class="text-grey-6 q-mt-md">暂无消息</div>
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

import { parseTime, toNow } from 'src/utils/time'

import { useAppStore } from 'stores/app'

import { getMyInfo, getNotifications, markNotifications } from 'src/services/user'

import type { GetNotifications } from 'src/services/user/type'

const router = useRouter()
const appStore = useAppStore()
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
    appStore.user = await getMyInfo()
  } catch {
    // 保持通知页主流程可用，badge 刷新失败不阻断跳转
  }
}

// 格式化时间 - 使用项目统一的时间格式化函数
const formatTime = (time: string) => {
  return toNow(parseTime(time))
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

  if (notification.ObjectType === 'Book' && notification.Extra?.object_id) {
    router.push({
      name: 'BookInfo',
      params: { bid: notification.Extra.object_id },
    })
    return
  }

  if (notification.ObjectType === 'Announcement' && notification.Extra?.object_id) {
    router.push({
      name: 'AnnouncementDetail',
      params: { id: notification.Extra.object_id },
    })
    return
  }

  if (notification.ObjectType === 'CommunityThread' && notification.Extra?.object_id) {
    router.push({
      name: 'ForumThread',
      params: { id: notification.Extra.object_id },
      query: {
        replyId: notification.Extra.reply_id ? String(notification.Extra.reply_id) : undefined,
        parentReplyId: notification.Extra.parent_reply_id ? String(notification.Extra.parent_reply_id) : undefined,
      },
    })
  }
}

const getNotificationLabel = (notification: GetNotifications.Notification) => {
  if (notification.Type === 'Comment') {
    return notification.ObjectType === 'Announcement' ? '评论了你的公告' : '评论了你的书籍'
  }

  if (notification.Type === 'CommentReply') {
    return notification.ObjectType === 'Announcement' ? '回复了你的评论' : '回复了你的评论'
  }

  if (notification.Type === 'CommunityReply') {
    return '回复了你的帖子'
  }

  if (notification.Type === 'CommunityReplyReply') {
    return '回复了你的社区回复'
  }

  return notification.Type
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
</script>

<style scoped lang="scss">
.notification-page {
  max-width: 900px;
  margin: 0 auto;
}

.notification-item {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &.unread {
    background-color: rgba(33, 150, 243, 0.04);
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

.notification-content {
  min-width: 0;
  flex: 1;
}

.notification-text {
  line-height: 1.6;
}

.notification-preview-container {
  .notification-preview {
    border-left: 3px solid #2196f3;
    font-size: 13px;
    line-height: 1.5;
  }

  .notification-preview__reply {
    padding-left: 10px;
    border-left: 2px solid #cbd5e1;
    color: #475569;
    font-size: 12px;
    line-height: 1.5;
  }

  .notification-preview-left {
    flex: 1;
    min-width: 0;
  }

  .notification-preview-right {
    flex: none;
    width: 180px;
    max-width: 30%;

    .notification-preview {
      border-left: 2px solid #9e9e9e;
      font-size: 12px;
      max-height: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      line-clamp: 4;
      -webkit-box-orient: vertical;
    }
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
