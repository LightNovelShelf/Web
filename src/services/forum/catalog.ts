export type CommunityBoardKey = 'all' | 'anime' | 'comic' | 'game' | 'novel' | 'website'

export interface CommunityCatalogSubCategory {
  key: string
  label: string
}

export interface CommunityCatalogBoard {
  key: Exclude<CommunityBoardKey, 'all'>
  label: string
  description: string
  icon: string
  subCategories: CommunityCatalogSubCategory[]
}

export const communityCatalogBoards: CommunityCatalogBoard[] = [
  {
    key: 'anime',
    label: '动画',
    description: '新番、作画、剧情考据和角色讨论',
    icon: 'mdiVideo',
    subCategories: [{ key: 'other', label: '其他' }],
  },
  {
    key: 'comic',
    label: '漫画',
    description: '连载追更、分镜表现和作者杂谈',
    icon: 'mdiImage',
    subCategories: [{ key: 'other', label: '其他' }],
  },
  {
    key: 'game',
    label: '游戏',
    description: 'Gal、JRPG、抽卡玩法和剧情线讨论',
    icon: 'mdiController',
    subCategories: [{ key: 'other', label: '其他' }],
  },
  {
    key: 'novel',
    label: '小说',
    description: '轻小说、电子书和章节更新的读后感',
    icon: 'mdiBook',
    subCategories: [
      { key: 'other', label: '其他' },
      { key: 'epub', label: 'EPUB' },
    ],
  },
  {
    key: 'website',
    label: '站务',
    description: '功能建议、站点反馈和社区活动公告',
    icon: 'mdiBullhorn',
    subCategories: [{ key: 'other', label: '其他' }],
  },
]

export function getCommunityCatalogBoard(key?: string) {
  return communityCatalogBoards.find((item) => item.key === key)
}
