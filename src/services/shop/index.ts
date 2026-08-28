import { requestWithSignalr } from '@/services/internal/request'

import type * as Types from './type'

export type { ShopItem, OwnedItem } from './type'

/** 补签卡的道具 key，与后端 ShopService.SignMakeupKey 一致 */
export const SIGN_MAKEUP_KEY = 'sign_makeup'

/** 商城货架（含余额、持有量、本月已购数） */
export function getShop() {
  return requestWithSignalr<Types.GetShop.Response>('GetShop', {})
}

/** 我持有的道具（数量大于 0） */
export function getMyItems() {
  return requestWithSignalr<Types.GetMyItems.Response>('GetMyItems', {})
}

/** 购买道具 */
export function buyShopItem(req: Types.BuyShopItem.Request) {
  return requestWithSignalr<Types.BuyShopItem.Response>('BuyShopItem', req)
}

/** 使用补签卡补签指定日期 */
export function useSignMakeupCard(req: Types.UseSignMakeupCard.Request) {
  return requestWithSignalr<Types.UseSignMakeupCard.Response>('UseSignMakeupCard', req)
}
