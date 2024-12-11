/** 贡献者卡片 */
export interface Card {
  Id: string
  Job: string
  /** 头像 */
  Avatar: string
  /** 昵称一类的东西 */
  Title: string
  /** 简短自我介绍 */
  Description: string
}

/** 贡献者卡片大小样式 */
export enum CardSize {
  normal = 'normal',
  small = 'small',
  nano = 'nano',
}
