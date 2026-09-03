<template>
  <q-page padding>
    <div class="list-card" style="max-width: 900px">
      <div class="column gap-16">
        <div class="row items-center">
          <div class="text-h5 text-weight-medium">商城</div>
          <q-space />
          <div class="row items-center no-wrap">
            <coin-icon size="20px" />
            <span class="q-ml-xs text-subtitle1">{{ coin }}</span>
          </div>
        </div>

        <div class="shop-grid">
          <div v-for="item in items" :key="item.Key">
            <q-card class="card shop-item" bordered flat>
              <q-card-section horizontal class="q-pa-md full-height">
                <system-image class="shop-item__image" :url="itemImage(item.Image)" :request-height="192" :ratio="1" />

                <div class="col q-ml-md column justify-between">
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ item.Name }}</div>
                    <div class="text-caption text-opacity">{{ item.Description }}</div>
                  </div>

                  <div class="row items-center q-mt-sm">
                    <coin-icon size="18px" />
                    <span class="q-ml-xs text-weight-medium">{{ item.Price }}</span>
                    <q-space />
                    <q-btn
                      unelevated
                      color="primary"
                      size="sm"
                      :label="remaining(item) > 0 ? '购买' : item.MonthlyLimit === 0 ? '不可购买' : '本月已达上限'"
                      :disable="remaining(item) <= 0"
                      :loading="buying === item.Key"
                      @click="buy(item)"
                    />
                  </div>

                  <div class="text-caption text-opacity q-mt-xs">
                    持有 {{ item.Owned }} ·
                    {{ item.MonthlyLimit == null ? '不限购' : `本月还可买 ${remaining(item)}/${item.MonthlyLimit}` }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-h6 text-weight-medium q-pt-md">我的道具</div>

        <q-list class="card" bordered separator v-if="ownedItems.length">
          <q-item v-for="item in ownedItems" :key="item.Key">
            <q-item-section avatar>
              <system-image class="owned-item__image" :url="itemImage(item.Image)" :request-height="96" :ratio="1" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.Name }}</q-item-label>
              <q-item-label caption>{{ item.Description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center no-wrap gap-8">
                <span>x{{ item.Quantity }}</span>
                <q-btn
                  v-if="item.Key === SIGN_MAKEUP_KEY"
                  outline
                  size="sm"
                  color="primary"
                  label="去补签"
                  @click="signInVisible = true"
                />
                <q-btn
                  v-if="item.Key === COMIC_QUOTA_50_KEY"
                  outline
                  size="sm"
                  color="primary"
                  label="使用"
                  :loading="usingQuota"
                  @click="useQuota()"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="card q-pa-lg text-center text-opacity">还没有任何道具</div>
      </div>
    </div>

    <sign-in-dialog
      v-model="signInVisible"
      :streak="growth?.SignStreak ?? 0"
      :today-signed="growth?.TodaySigned ?? false"
      @signed="load"
    />
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { useAppStore } from '@/stores/app'

import CoinIcon from '@/components/points/CoinIcon.vue'
import SignInDialog from '@/components/points/SignInDialog.vue'
import SystemImage from '@/components/SystemImage.vue'

import { apiServer } from '@/services/apiServer'
import {
  COMIC_QUOTA_50_KEY,
  SIGN_MAKEUP_KEY,
  buyShopItem,
  getMyItems,
  getShop,
  useComicQuotaCard,
} from '@/services/shop'

import type { OwnedItem, ShopItem } from '@/services/shop'

const $q = useQuasar()
const appStore = useAppStore()
const { user } = storeToRefs(appStore)

// 余额以 GetShop 返回为准，购买后由 OnGrowthUpdate 推送同步 user.Growth
const growth = computed(() => user.value?.Growth)
const coin = computed(() => growth.value?.Coin ?? shopCoin.value)

const shopCoin = ref(0)
const items = ref<ShopItem[]>([])
const ownedItems = ref<OwnedItem[]>([])
const buying = ref('')
const usingQuota = ref(false)
const signInVisible = ref(false)

function remaining(item: ShopItem) {
  // 线上 MessagePack/gzip 序列化会丢掉 null 字段，undefined 与 null 都表示不限购
  return item.MonthlyLimit == null ? Infinity : Math.max(0, item.MonthlyLimit - item.MonthlyPurchased)
}

// 道具图放在 API 的 wwwroot 下，后端只下发相对路径；站内资源图（{res:ID}）解析出来已经是绝对地址
function itemImage(url: string) {
  return url?.startsWith('http') ? url : apiServer.value + url
}

async function load() {
  try {
    const [shop, mine] = await Promise.all([getShop(), getMyItems()])
    shopCoin.value = shop.Coin
    items.value = shop.Items
    ownedItems.value = mine.Items
  } catch (err) {
    $q.notify({ type: 'negative', message: getErrMsg(err) })
  }
}

function buy(item: ShopItem) {
  $q.dialog({
    title: '确认购买',
    message: `花费 ${item.Price} 金币购买 1 个「${item.Name}」？`,
    cancel: true,
  }).onOk(async () => {
    buying.value = item.Key
    try {
      const res = await buyShopItem({ Key: item.Key, Quantity: 1 })
      $q.notify({ type: 'positive', message: `购买成功，现在持有 ${res.Owned} 个` })
      await load()
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrMsg(err) })
    } finally {
      buying.value = ''
    }
  })
}

function useQuota() {
  $q.dialog({
    title: '使用漫画额度卡',
    message: '使用后立即获得 50 点漫画额度，永不过期。',
    cancel: true,
  }).onOk(async () => {
    usingQuota.value = true
    try {
      const res = await useComicQuotaCard()
      $q.notify({ type: 'positive', message: `已发放 ${res.Granted} 点漫画额度，当前余额 ${res.Quota} 点` })
      await load()
    } catch (err) {
      $q.notify({ type: 'negative', message: getErrMsg(err) })
    } finally {
      usingQuota.value = false
    }
  })
}

onMounted(load)
</script>

<style lang="scss" scoped>
.list-card {
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  .card {
    border-radius: 4px;
  }
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.shop-item {
  height: 100%;
}

.shop-item__image {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  flex: 0 0 auto;
}

.owned-item__image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
</style>
