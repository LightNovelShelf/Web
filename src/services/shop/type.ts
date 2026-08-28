/** 商城/道具相关接口类型；字段为 PascalCase，直接映射后端返回 */

/** 货架上的道具 */
export interface ShopItem {
  Key: string
  Name: string
  Description: string
  /** 道具图片 URL；站内资源会带 placeholder/size 查询参数 */
  Image: string
  /** 单价（金币），由后端按签到金币规则推导 */
  Price: number
  /** 当前持有数量 */
  Owned: number
  /** 每个自然月购买上限 */
  MonthlyLimit: number
  /** 本自然月已购数量 */
  MonthlyPurchased: number
}

/** 我持有的道具 */
export interface OwnedItem {
  Key: string
  Name: string
  Description: string
  Image: string
  Quantity: number
}

export namespace GetShop {
  export type Request = Record<string, never>
  export interface Response {
    Coin: number
    Items: ShopItem[]
  }
}

export namespace GetMyItems {
  export type Request = Record<string, never>
  export interface Response {
    Items: OwnedItem[]
  }
}

export namespace BuyShopItem {
  export interface Request {
    Key: string
    Quantity: number
  }
  export interface Response {
    Key: string
    Owned: number
    Coin: number
    Cost: number
    MonthlyPurchased: number
  }
}

export namespace UseSignMakeupCard {
  export interface Request {
    /** 要补签的日期，yyyy-MM-dd（UTC，与签到日期口径一致） */
    Date: string
  }
  export interface Response {
    Date: string
    Streak: number
    Reward: number
    CoinReward: number
    Owned: number
  }
}
