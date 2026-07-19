<!-- 通用文件夹卡片：2×3 卡片内以 2×2 网格展示最多 4 张封面，右下角文件夹角标 + 可选数量徽标 -->
<template>
  <component
    :is="to ? 'router-link' : 'a'"
    class="cursor-pointer"
    :to="to"
    :href="to ? undefined : '#'"
    @click="onClick"
  >
    <div class="folder-cover">
      <q-card>
        <q-responsive :ratio="2 / 3">
          <!-- q-responsive 只接受单一子元素，故所有内容包在一个定位容器里 -->
          <div class="cover-wrap">
            <!-- 单封面：铺满整卡 -->
            <q-img v-if="limitedCovers.length <= 1" class="single-cover" :src="limitedCovers[0]" :ratio="2 / 3">
              <template v-if="firstPlaceholder && generalSetting.enableBlurHash" v-slot:loading>
                <blur-hash :blurhash="firstPlaceholder" />
              </template>
            </q-img>
            <!-- 多封面：2×2 网格 -->
            <div v-else class="books-group">
              <q-img v-for="(cover, i) in limitedCovers" :key="i" class="books-group-cover" :src="cover" :ratio="2 / 3">
                <template v-if="getPlaceholder(cover) && generalSetting.enableBlurHash" v-slot:loading>
                  <blur-hash :blurhash="getPlaceholder(cover)" />
                </template>
              </q-img>
            </div>

            <!-- 数量徽标：显示系列内书籍数量 -->
            <div v-if="count != null" class="folder-count">{{ count }} 本</div>
          </div>
        </q-responsive>
      </q-card>
    </div>

    <div style="padding: 4px">
      <div class="folder-name">
        <div class="folder-name-text" :title="title">{{ title }}</div>
      </div>
      <div v-if="updatedAt" class="folder-update-time">{{ updateTime }}</div>
    </div>

    <slot name="footer" />
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { getPlaceholder } from 'src/utils/url'

import { useSettingStore } from 'stores/setting'

import { BlurHash } from 'components'

import { useToNowRef } from 'src/composition/useToNowRef'

import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  /** 文件夹标题 */
  title: string
  /** 封面列表，最多展示 4 张 */
  covers: string[]
  /** 数量徽标，不传则不展示 */
  count?: number
  /** 最近更新时间，不传则不展示 */
  updatedAt?: Date | string
  /** 点击跳转目标；不传则渲染为 <a> 并派发 click 事件 */
  to?: RouteLocationRaw
}>()

const emit = defineEmits<{ click: [] }>()

const { generalSetting } = useSettingStore()
const limitedCovers = computed(() => (props.covers ?? []).filter(Boolean).slice(0, 4))
const firstPlaceholder = computed(() => getPlaceholder(limitedCovers.value[0] ?? ''))
const updateTime = useToNowRef(() => props.updatedAt)

function onClick(evt: MouseEvent) {
  if (!props.to) {
    evt.preventDefault()
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixin';

.folder-cover {
  position: relative;
  box-sizing: border-box;
}

.cover-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.single-cover,
.books-group-cover {
  transition: transform 0.25s ease;
}

.single-cover {
  width: 100%;
  height: 100%;
}

.cursor-pointer:hover .single-cover,
.cursor-pointer:hover .books-group-cover {
  transform: scale(1.025);
}

.books-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  padding: 10px;
}

.books-group-cover {
  border-radius: 4px;
}

// 参考 BookCard 的分类角标：右上贴边、左侧圆角胶囊
.folder-count {
  position: absolute;
  top: 8px;
  right: 0;
  color: white;
  padding: 0 3px 0 6px;
  font-size: 12px;
  background-color: #1976d2;
  border-radius: 1em 0 0 1em;
}

.folder-name {
  display: flex;
  align-items: flex-start;
  --font-size: 12px;
  --line-height: 1.6;
  line-height: var(--line-height);
  font-size: var(--font-size);
  height: calc(var(--font-size) * var(--line-height) * 2);

  .folder-name-text {
    @include ellipsis(2);
  }
}

.folder-update-time {
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  opacity: 0.6;
}
</style>
