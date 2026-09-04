<template>
  <drag-page-sticky v-slot="{ isDragging }">
    <q-fab icon="mdiPlus" direction="up" color="accent" :disable="isDragging">
      <q-fab-action color="primary" icon="mdiContentSave" :disable="isDragging || disabled" @click="emit('save')">
        <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
          保存
        </q-tooltip>
      </q-fab-action>
    </q-fab>
  </drag-page-sticky>
</template>

<script lang="ts" setup>
import { DragPageSticky } from '@/components'

defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ save: [] }>()
</script>
