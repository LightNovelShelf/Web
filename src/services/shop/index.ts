import { invokeHub } from '@/services/transport'

import type * as Types from './type'

export type { ShopItem, OwnedItem } from './type'

/** 补签卡的道具 key，与后端 ShopService.SignMakeupKey 一致 */
export const SIGN_MAKEUP_KEY = 'sign_makeup'

/** 改名卡的道具 key，与后端 ShopService.RenameCardKey 一致 */
export const RENAME_CARD_KEY = 'rename_card'

/** 商城货架（含余额、持有量、本月已购数） */
export function getShop() {
  return invokeHub<Types.GetShop.Response>('GetShop', {})
}

/** 我持有的道具（数量大于 0） */
export function getMyItems() {
  return invokeHub<Types.GetMyItems.Response>('GetMyItems', {})
}

/** 购买道具 */
export function buyShopItem(req: Types.BuyShopItem.Request) {
  return invokeHub<Types.BuyShopItem.Response>('BuyShopItem', req)
}

/** 使用补签卡补签指定日期 */
export function useSignMakeupCard(req: Types.UseSignMakeupCard.Request) {
  return invokeHub<Types.UseSignMakeupCard.Response>('UseSignMakeupCard', req)
}

/** 使用改名卡修改用户名 */
export function useRenameCard(req: Types.UseRenameCard.Request) {
  return invokeHub<Types.UseRenameCard.Response>('UseRenameCard', req)
}

/** 使用一个无需额外参数的道具（GetMyItems 中 Usable 为 true） */
export function useShopItem(req: Types.UseShopItem.Request) {
  return invokeHub<Types.UseShopItem.Response>('UseShopItem', req)
}
