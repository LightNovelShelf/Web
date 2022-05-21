<template>
  <q-page padding>
    <div class="full-width flex justify-center">
      <div class="flex no-wrap justify-center q-gutter-md">
        <div>
          <div style="position: sticky; top: 66px">
            <q-list dense>
              <q-item dense clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar color="teal" text-color="white" :icon="icon.mdiCommentMultiple" />
                </q-item-section>
                <q-item-section>全部主题</q-item-section>
              </q-item>
              <q-item dense clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar color="teal" text-color="white" :icon="icon.mdiCommentMultiple" />
                </q-item-section>
                <q-item-section>全部主题</q-item-section>
              </q-item>
              <q-item dense clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar color="teal" text-color="white" :icon="icon.mdiCommentMultiple" />
                </q-item-section>
                <q-item-section>全部主题</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div style="max-width: 700px">
          <q-breadcrumbs class="text-grey" active-color="purple" style="padding-bottom: 8px">
            <q-breadcrumbs-el label="全部社区" />
            <q-breadcrumbs-el label="社区标题" />
          </q-breadcrumbs>
          <div class="q-gutter-y-md">
            <q-card>
              <q-img
                :ratio="3"
                no-spinner
                no-native-menu
                src="https://img.lightnovel.app:45220/images/2022/05/10/bf70ac850f76303772b615e37d11e481d9646967.jpg"
              >
                <div class="absolute-full text-subtitle2">
                  <div class="q-gutter-y-sm text-center">
                    <div class="text-h6">社区标题</div>

                    <div>社区描述和简易规则</div>
                  </div>
                </div>
              </q-img>
            </q-card>

            <q-select
              :disable="false"
              emit-value
              map-options
              filled
              v-model="order"
              :options="options"
              label="排序"
              style="max-width: 200px; margin-left: auto"
            />

            <div class="thread-list">
              <div class="thread-list-container">
                <template v-for="index in 3" :key="index">
                  <div>
                    <div class="flex">
                      <div class="text-h6 col-grow">{{ index }} 贴子标题</div>
                      <div class="text-bold flex flex-center">
                        <q-badge color="blue" style="line-height: 1.5">精华</q-badge>
                      </div>
                    </div>

                    <div class="flex items-center text-caption">
                      <div class="col-grow">
                        <span class="text-bold user-name">@无语</span><span class="text-grey"> · 3天前</span>
                      </div>
                      <q-icon size="16px" color="orange">
                        <i-fa-solid-thumbtack />
                      </q-icon>
                      <q-icon size="16px" color="pink">
                        <i-mdi-lock />
                      </q-icon>
                    </div>
                    <div class="text-caption text-grey text-justify">
                      内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容
                      内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容 内容内容内容...
                    </div>
                  </div>

                  <div class="thread-info">
                    <div class="flex items-center">
                      <q-icon class="left-icon" size="16px">
                        <i-mdi-comment />
                      </q-icon>
                      99
                    </div>
                    <div class="flex items-center" style="margin-top: 4px">
                      <q-icon class="left-icon" size="16px">
                        <i-mdi-eye />
                      </q-icon>
                      99.9万
                    </div>
                  </div>

                  <q-separator class="separator" />
                </template>

                <template v-for="index in 10" :key="index">
                  <div>
                    <div class="flex">
                      <div class="text-h6 col-grow">{{ index }} 贴子标题</div>
                      <div class="text-bold flex flex-center">
                        <q-badge color="blue" style="line-height: 1.5">精华</q-badge>
                      </div>
                    </div>

                    <div class="flex items-center text-caption">
                      <div class="col-grow">
                        <span class="text-bold user-name">@无语</span><span class="text-grey"> · 3天前</span>
                      </div>
                      <q-icon size="16px" color="orange">
                        <i-fa-solid-thumbtack />
                      </q-icon>
                      <q-icon size="16px" color="pink">
                        <i-mdi-lock />
                      </q-icon>
                    </div>
                  </div>

                  <div class="thread-info">
                    <div class="flex items-center">
                      <q-icon class="left-icon" size="16px">
                        <i-mdi-comment />
                      </q-icon>
                      99
                    </div>
                    <div class="flex items-center" style="margin-top: 4px">
                      <q-icon class="left-icon" size="16px">
                        <i-mdi-eye />
                      </q-icon>
                      99.9万
                    </div>
                  </div>

                  <q-separator class="separator" />
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="col-grow">
          <div class="q-gutter-y-md">
            <q-card>
              <q-card-section class="text-teal">
                <div class="flex items-center">
                  <q-icon size="18px" class="left-icon">
                    <i-mdi-chart-pie />
                  </q-icon>
                  <span>社区统计</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <div class="text-opacity">贴子总计</div>
                    <div class="text-h6">11</div>
                  </div>
                  <div class="col-4">
                    <div class="text-opacity">回复总计</div>
                    <div class="text-h6">45</div>
                  </div>
                  <div class="col-4">
                    <div class="text-opacity">今日新贴</div>
                    <div class="text-h6">14</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <q-card class="hot-card">
              <q-list bordered>
                <q-item-label header>
                  <div class="flex items-center">
                    <q-icon color="red" size="20px" class="left-icon">
                      <i-mdi-fire />
                    </q-icon>
                    <span class="text-teal">热门</span>
                  </div>
                </q-item-label>
                <q-item style="font-size: 13px">
                  <q-item-section>
                    <q-item-label class="hot-item" v-for="index in 5" :key="index">
                      {{ index }} 你你你你你你你你你你你你你你你你
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { getForumInfo } from 'src/services/forum'
import { icon } from 'assets/icon'
import { useInitRequest } from 'src/composition/biz/useInitRequest'

const props = defineProps<{ id: string }>()
const _id = computed(() => ~~props.id || 1)

const order = ref('latest')
const options = [
  {
    label: '最近更新',
    value: 'latest'
  },
  {
    label: '上架时间',
    value: 'new'
  },
  {
    label: '总点击量',
    value: 'view'
  }
]

const data = ref()
const request = async () => {
  data.value = await getForumInfo({ Id: 1 })
}

// useInitRequest(request)
</script>

<style scoped lang="scss">
.thread-list-container {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;

  .separator {
    grid-column: 1 / span 2;
  }

  .thread-info,
  .user-name {
    color: #667c99;
  }

  .thread-info {
    padding-top: 6px;
  }
}

.left-icon {
  margin-right: 6px;
}

.hot-card {
  max-width: 16em;

  .hot-item {
    color: $grey-9;
    cursor: pointer;

    &:hover {
      text-decoration: underline $grey-9 solid;
    }
  }
}
</style>
