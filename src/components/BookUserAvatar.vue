<template>
  <div class="book-user-avatar">
    <q-avatar :size="size">
      <img :src="user.Avatar" alt="book_user" />
    </q-avatar>
    <q-menu :offset="[-30, 5]" anchor="bottom left" self="top right">
      <q-card>
        <q-card-section>{{ user.UserName }}</q-card-section>
      </q-card>
    </q-menu>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    user: {
      Avatar: string
      UserName: string
    }
    size?: string
  }>(),
  { size: '40px' },
)
</script>

<style lang="scss" scoped>
.book-user-avatar {
  cursor: pointer;
}
</style>
