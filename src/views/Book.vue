<template>
  <n-space>
    <div style="min-width: 400px">
      <n-cascader
        v-model="value"
        :options="options"
        :cascade="cascade"
        :leaf-only="leafOnly"
        :show-path="showPath"
        :filterable="filterable"
        placeholder="没啥用的值"
      />
    </div>
  </n-space>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Book',
  data() {
    return {
      leafOnly: true,
      cascade: true,
      showPath: true,
      hoverTrigger: false,
      filterable: false,
      value: null,
      options: [
        {
          label: '上架时间',
          value: 'last',
        },
        {
          label: '最近更新',
          value: 'new',
        },
        {
          label: '人气值',
          value: 'rank',
          children: [
            {
              label: '日榜',
              value: 'daily'
            },
            {
              label: '周榜',
              value: 'weekly'
            },
            {
              label: '月榜',
              value: 'Monthly'
            },
            {
              label: '总榜',
              value: 'all'
            }
          ]
        }
      ]
    }
  },
  setup() {
    return {}
  }
})
</script>

<style scoped></style>
