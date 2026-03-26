export type CommunityBoardKey = 'all' | 'anime' | 'comic' | 'game' | 'novel' | 'website'

export type CommunityFeedOrder = 'latest' | 'hot' | 'featured'

export type CommunityFeedScope = 'all' | 'today' | 'week'

export interface CommunitySubCategorySummary {
  key: string
  label: string
  count: number
}

export interface CommunityPagination {
  page: number
  size: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface CommunityListQuery {
  boardKey?: CommunityBoardKey
  subCategoryKey?: string
  order?: CommunityFeedOrder
  scope?: CommunityFeedScope
  page?: number
  size?: number
}

export interface CommunityBoardSummary {
  id: number
  key: CommunityBoardKey
  title: string
  description: string
  icon: string
  todayPosts: number
  heatLabel: string
}

export interface CommunityFeedItem {
  id: number
  boardKey: Exclude<CommunityBoardKey, 'all'>
  boardName: string
  subCategoryKey?: string
  subCategoryLabel?: string
  title: string
  excerpt: string
  authorName: string
  authorAvatar: string
  publishedAt: string
  replies: number
  views: number
  heat: number
  likes: number
  favorites: number
  tags: string[]
  featured?: boolean
  pinned?: boolean
  locked?: boolean
  liked?: boolean
  favorited?: boolean
}

export interface CommunityHotRankItem {
  id: number
  title: string
  boardName: string
  heat: number
  deltaLabel: string
}

export interface CommunityActiveUserItem {
  id: number
  name: string
  avatar: string
  badge: string
  score: number
  summary: string
}

export interface CommunityReplyTarget {
  id: number
  authorName: string
}

export interface CommunityThreadReply {
  id: number
  authorName: string
  authorBadge?: string
  authorAvatar: string
  publishedAt: string
  content: string
  likes: number
  liked?: boolean
  replyTo?: CommunityReplyTarget
  childReplies: CommunityThreadReply[]
  childPage: CommunityPagination
}

export interface CommunityThreadDetail extends CommunityFeedItem {
  body: string[]
  bodyHtml: string
  repliesPage: CommunityPagination
  replyItems: CommunityThreadReply[]
  relatedThreads: CommunityFeedItem[]
}

export interface CommunityHomePayload {
  title: string
  subtitle: string
  announcement: string
  announcementLink: string
  todayThreads: number
  onlineUsers: number
  boards: CommunityBoardSummary[]
  subCategories: CommunitySubCategorySummary[]
  selectedSubCategoryKey: string
  feed: CommunityFeedItem[]
  feedPage: CommunityPagination
  hotThreads: CommunityHotRankItem[]
  activeUsers: CommunityActiveUserItem[]
}

export interface CreateCommunityThreadRequest {
  boardKey: Exclude<CommunityBoardKey, 'all'>
  subCategoryKey?: string
  title: string
  contentHtml: string
  authorName: string
}

export interface CreateCommunityReplyRequest {
  threadId: number
  content: string
  authorName: string
  replyToId?: number
}

export interface GetCommunityReplyChildrenRequest {
  threadId: number
  parentReplyId: number
  page?: number
  size?: number
}

export interface CommunityMyReplyItem {
  id: number
  threadId: number
  threadTitle: string
  boardName: string
  content: string
  publishedAt: string
  likes: number
  replyToName?: string
}

export interface CommunityMyOverview {
  authorName: string
  publishedThreads: CommunityFeedItem[]
  participatedReplies: CommunityMyReplyItem[]
  favoriteThreads: CommunityFeedItem[]
}
