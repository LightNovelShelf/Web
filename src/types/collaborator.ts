/** 贡献者卡片 */
export interface Card {
  key: string
  id: string
  /** 头像 */
  avast: string
  /** 昵称 */
  nickname: string
  /** 简短自我介绍 */
  bio: string
}

/** 贡献者卡片大小样式 */
export enum CardSize {
  normal = 'normal',
  small = 'small',
  nano = 'nano'
}
