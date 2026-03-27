export type CommunityBoardKey = string

export interface CommunityCatalogSubCategory {
  Id: number
  Key: string
  Label: string
}

export interface CommunityCatalogBoard {
  Id: number
  Key: Exclude<CommunityBoardKey, 'all'>
  Title: string
  Description: string
  Icon: string
  SubCategories: CommunityCatalogSubCategory[]
}
