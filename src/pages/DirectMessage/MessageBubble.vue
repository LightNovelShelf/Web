<template>
  <div class="message-bubble" :class="mine ? 'message-bubble--mine' : 'message-bubble--peer'">
    <div class="message-bubble__body" :class="{ 'message-bubble__body--failed': status === 'failed' }">
      {{ content }}
    </div>

    <div class="message-bubble__meta text-caption text-opacity">
      <time-ago :value="createdAt" />

      <template v-if="status === 'pending'">
        <span>发送中</span>
      </template>

      <template v-else-if="status === 'failed'">
        <span class="text-negative">发送失败</span>
        <q-btn dense flat no-caps size="sm" color="negative" icon="mdiRefresh" label="重试" @click="emit('retry')" />
      </template>

      <template v-else-if="showReceipt">
        <span>{{ read ? '已读' : '已送达' }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import TimeAgo from '@/components/TimeAgo.vue'

withDefaults(
  defineProps<{
    /** 正文只做文本插值渲染，服务端不做 HTML 转义，禁止 v-html */
    content: string
    createdAt: string
    mine: boolean
    status?: 'sent' | 'pending' | 'failed'
    /** 只有自己的最后一条消息才传 true */
    showReceipt?: boolean
    read?: boolean
  }>(),
  {
    status: 'sent',
    showReceipt: false,
    read: false,
  },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<style scoped lang="scss">
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: min(560px, 78%);

  &--mine {
    align-self: flex-end;
    align-items: flex-end;
  }

  &--peer {
    align-self: flex-start;
    align-items: flex-start;
  }
}

.message-bubble__body {
  padding: 8px 12px;
  border-radius: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background-color: rgba(0, 0, 0, 0.05);

  &--failed {
    opacity: 0.7;
  }
}

.body--dark .message-bubble__body {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-bubble--mine .message-bubble__body {
  color: #fff;
  background-color: var(--q-primary);
}

.message-bubble__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  min-height: 20px;
}
</style>
