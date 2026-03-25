import type { ListResult } from '../types'

export enum ForumType {
  Anime = 'Anime',
  Comic = 'Comic',
  Game = 'Game',
  Novel = 'Novel',
  Website = 'Website',
}

export namespace GetForumList {
  export interface Request {
    Page: number
    Size: number
    ForumType: ForumType
  }
  export type Response = ListResult<any>
}

export namespace GetForumInfo {
  export interface Request {
    Id: number
  }
  export type Response = any
}

export type CommunityBoardKey = 'all' | 'anime' | 'comic' | 'game' | 'novel' | 'website'

export type CommunityFeedOrder = 'latest' | 'hot' | 'featured'

export type CommunityFeedScope = 'all' | 'today' | 'week'

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
  boardKey: CommunityBoardKey
  boardName: string
  title: string
  excerpt: string
  authorName: string
  authorAvatar: string
  publishedAt: string
  replies: number
  views: number
  heat: number
  tags: string[]
  featured?: boolean
  pinned?: boolean
  locked?: boolean
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

export interface CommunityHomePayload {
  title: string
  subtitle: string
  announcement: string
  announcementLink: string
  todayThreads: number
  onlineUsers: number
  boards: CommunityBoardSummary[]
  feed: CommunityFeedItem[]
  hotThreads: CommunityHotRankItem[]
  activeUsers: CommunityActiveUserItem[]
}

export interface GetCommunityHomePayloadRequest {
  boardKey?: CommunityBoardKey
  order?: CommunityFeedOrder
  scope?: CommunityFeedScope
}

export interface CreateCommunityThreadRequest {
  boardKey: Exclude<CommunityBoardKey, 'all'>
  title: string
  contentHtml: string
  authorName: string
}

export interface CommunityThreadReply {
  id: number
  authorName: string
  authorBadge?: string
  publishedAt: string
  content: string
  likes: number
  liked?: boolean
}

export interface CommunityThreadDetail {
  id: number
  boardKey: CommunityBoardKey
  boardName: string
  title: string
  excerpt: string
  authorName: string
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
  body: string[]
  bodyHtml: string
  repliesPreview: CommunityThreadReply[]
  relatedThreads: CommunityFeedItem[]
}
