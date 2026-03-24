<template>
  <section class="composer">
    <div class="composer__copy">
      <div class="composer__title">想聊点什么？</div>
      <p class="composer__text">
        {{ user ? '从今天的内容开始，发起一个问题、长评或安利帖。' : '登录后就能发帖、回复和收藏讨论。' }}
      </p>
      <div class="composer__chips">
        <span v-for="chip in chips" :key="chip" class="composer__chip">{{ chip }}</span>
      </div>
    </div>

    <div class="composer__box">
      <div class="composer__placeholder">
        {{ user ? '输入标题或一句话开场，比如“这季最想追的作品是？”' : '登录后参与讨论，和站内读者一起交换看法。' }}
      </div>
      <q-btn unelevated no-caps color="primary" class="composer__action" :label="user ? '发布帖子' : '登录后参与讨论'" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ user: any }>()

const chips = ['发起讨论', '提问求助', '安利推荐']
</script>

<style scoped lang="scss">
.composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 20px 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.94);
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.08);
}

.composer__title {
  font-size: 21px;
  font-weight: 700;
  color: var(--community-text);
}

.composer__text {
  margin: 8px 0 0;
  color: var(--community-text-soft);
  font-size: 14px;
  line-height: 1.6;
}

.composer__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.composer__chip {
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: var(--community-accent);
  font-size: 12px;
  font-weight: 600;
}

.composer__box {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 18px;
  background: rgba(239, 246, 255, 0.72);
}

.composer__placeholder {
  flex: 1;
  color: var(--community-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

.composer__action {
  border-radius: 14px;
  padding: 0 18px;
  min-height: 42px;
  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.2);
}

@media (max-width: 1100px) {
  .composer {
    grid-template-columns: 1fr;
  }

  .composer__box {
    min-width: 0;
  }
}
</style>
