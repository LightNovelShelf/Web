<template>
  <div style="max-width: 80vw;margin: 0 auto">
    <n-space justify="space-around" size="large">
      <div>
        <n-cascader
          v-model="value"
          :options="options"
          :cascade="cascade"
          :leaf-only="leafOnly"
          :show-path="showPath"
          :filterable="filterable"
          placeholder="排序方式"
          style="min-width: 100px"
        />
      </div>
      <n-pagination v-model:page="page" :page-count="100" />
    </n-space>
  </div>
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
      value: 'last',
      options: [
        {
          label: '上架时间',
          value: 'last'
        },
        {
          label: '最近更新',
          value: 'new'
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
      ],
      page: 1
    }
  },
  setup() {
    return {}
  }
})
</script>

<style scoped></style>
