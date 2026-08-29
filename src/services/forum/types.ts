export type { CommunityBoardKey, CommunityCatalogBoard, CommunityCatalogSubCategory } from './catalog'
import type { CommunityBoardKey, CommunityCatalogBoard } from './catalog'

export type CommunityFeedOrder = 'reply' | 'latest' | 'hot' | 'featured'

export type CommunityFeedScope = 'all' | 'today' | 'week'

export interface CommunitySubCategorySummary {
  Key: string
  Label: string
  Count: number
}

export interface CommunityPagination {
  Page: number
  Size: number
  Total: number
  TotalPages: number
  HasMore: boolean
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
  Id: number
  Key: CommunityBoardKey
  Title: string
  Description: string
  Icon: string
  TodayPosts: number
  HeatLabel: string
}

export interface CommunityFeedItem {
  Id: number
  BoardKey: Exclude<CommunityBoardKey, 'all'>
  BoardName: string
  SubCategoryKey?: string
  SubCategoryLabel?: string
  Title: string
  Excerpt: string
  AuthorName: string
  AuthorIsDeleted: boolean
  AuthorAvatar: string
  PublishedAt: string
  Replies: number
  Views: number
  Heat: number
  Likes: number
  Favorites: number
  Tags: string[]
  Featured?: boolean
  Pinned?: boolean
  Locked?: boolean
}

export interface CommunityHotRankItem {
  Id: number
  Title: string
  BoardName: string
  Heat: number
  PublishedAt: string
}

export interface CommunityActiveUserItem {
  Id: number
  Name: string
  Avatar: string
  Badge: string
  Score: number
  Summary: string
}

export interface CommunityReplyTarget {
  Id: number
  AuthorName: string
  AuthorIsDeleted: boolean
}

export interface CommunityThreadReply {
  Id: number
  AuthorName: string
  AuthorIsDeleted: boolean
  AuthorBadge?: string
  AuthorAvatar: string
  PublishedAt: string
  Content: string
  Likes: number
  Liked?: boolean
  CanDelete?: boolean
  ReplyTo?: CommunityReplyTarget
  ChildReplies: CommunityThreadReply[]
  ChildPage: CommunityPagination
}

export interface CommunityThreadDetail extends CommunityFeedItem {
  Liked?: boolean
  Favorited?: boolean
  EditedAt?: string | null
  CanEdit?: boolean
  Content: string
  RepliesPage: CommunityPagination
  ReplyItems: CommunityThreadReply[]
  Focus?: { ReplyId: number } | null
  RelatedThreads: CommunityFeedItem[]
}

/** GetCommunityThreadEditInfo 的响应：只有编辑器要填的字段 */
export interface CommunityThreadEditInfo {
  Id: number
  BoardKey: string
  SubCategoryKey: string
  Title: string
  /** 正文，格式由 Format 说明 */
  Content: string
  Format: string
}

export interface CommunityHomePayload {
  Title: string
  Subtitle: string
  Announcement: string
  AnnouncementLink: string
  TodayThreads: number
  OnlineUserCount: number
  CatalogBoards: CommunityCatalogBoard[]
  Boards: CommunityBoardSummary[]
  SubCategories: CommunitySubCategorySummary[]
  SelectedSubCategoryKey: string
  Feed: CommunityFeedItem[]
  FeedPage: CommunityPagination
  HotThreads: CommunityHotRankItem[]
  ActiveUsers: CommunityActiveUserItem[]
}

export interface CommunityFeedPayload {
  SubCategories: CommunitySubCategorySummary[]
  SelectedSubCategoryKey: string
  Feed: CommunityFeedItem[]
  FeedPage: CommunityPagination
}

export interface CommunityCatalogPayload {
  CatalogBoards: CommunityCatalogBoard[]
}

export interface CreateCommunityThreadRequest {
  boardKey: Exclude<CommunityBoardKey, 'all'>
  subCategoryKey?: string
  title: string
  contentHtml: string
}

export interface UpdateCommunityThreadRequest extends CreateCommunityThreadRequest {
  threadId: number
}

export interface CreateCommunityReplyRequest {
  threadId: number
  content: string
  replyToId?: number
}

export interface GetCommunityReplyChildrenRequest {
  threadId: number
  parentReplyId: number
  page?: number
  size?: number
  afterReplyId?: number
}

export interface CommunityMyReplyItem {
  Id: number
  ThreadId: number
  ThreadTitle: string
  BoardName: string
  Content: string
  PublishedAt: string
  Likes: number
  ReplyToName?: string
}

export interface CommunityMyOverview {
  AuthorName: string
  PublishedThreads: CommunityFeedItem[]
  ParticipatedReplies: CommunityMyReplyItem[]
  FavoriteThreads: CommunityFeedItem[]
}
