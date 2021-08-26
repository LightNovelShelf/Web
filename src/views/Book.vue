<template>
  <div style="max-width: 80vw; margin: 0 auto">
    <div style="display: flex; justify-content: space-around">
      <n-cascader
        v-model:value="value"
        :options="options"
        :cascade="cascade"
        :leaf-only="leafOnly"
        :show-path="showPath"
        :filterable="filterable"
        placeholder="排序方式"
        style="max-width: 150px"
      />

      <n-pagination v-model:page="page" :page-count="100" />
    </div>

    <n-grid :x-gap="12" :y-gap="8" cols="3 700:4 1000:5 1300:6" style="padding-top: 24px">
      <n-grid-item v-for="(book, index) in bookData" :key="index">
        <book-card :book="book"></book-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import bookCard from "@/components/bookCard";

export default defineComponent({
  components:{
    bookCard
  },
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
      page: 2,
      bookData: [
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很短'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        }
      ]
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" scoped>

</style>
