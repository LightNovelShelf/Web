import { requestWithSignalr } from 'src/services/internal/request'

import type {
  CommunityHomePayload,
  CommunityListQuery,
  CommunityMyOverview,
  CommunityThreadDetail,
  CommunityThreadReply,
  CreateCommunityReplyRequest,
  CreateCommunityThreadRequest,
  GetCommunityReplyChildrenRequest,
} from './types'

export async function getCommunityHome(query: CommunityListQuery = {}): Promise<CommunityHomePayload> {
  return requestWithSignalr<CommunityHomePayload>('GetCommunityHome', {
    BoardKey: query.boardKey ?? 'all',
    SubCategoryKey: query.subCategoryKey ?? '',
    Order: query.order ?? 'latest',
    Scope: query.scope ?? 'all',
    Page: Math.max(1, query.page ?? 1),
    Size: Math.max(1, query.size ?? 6),
  })
}

export async function getCommunityThread(
  id: number,
  replyPage = 1,
  replySize = 5,
  options: { trackView?: boolean } = {},
): Promise<CommunityThreadDetail | null> {
  return requestWithSignalr<CommunityThreadDetail | null>('GetCommunityThread', {
    ThreadId: id,
    ReplyPage: Math.max(1, replyPage),
    ReplySize: Math.max(1, replySize),
    TrackView: options.trackView ?? replyPage === 1,
  })
}

export async function createCommunityThread(req: CreateCommunityThreadRequest): Promise<CommunityThreadDetail> {
  return requestWithSignalr<CommunityThreadDetail>('CreateCommunityThread', {
    BoardKey: req.boardKey,
    SubCategoryKey: req.subCategoryKey ?? '',
    Title: req.title,
    ContentHtml: req.contentHtml,
  })
}

export async function createCommunityReply(req: CreateCommunityReplyRequest): Promise<CommunityThreadReply> {
  return requestWithSignalr<CommunityThreadReply>('CreateCommunityReply', {
    ThreadId: req.threadId,
    Content: req.content,
    ReplyToId: req.replyToId,
  })
}

export async function toggleThreadLike(id: number) {
  return requestWithSignalr<{ liked: boolean; likes: number }>('ToggleCommunityThreadLike', {
    ThreadId: id,
  })
}

export async function toggleThreadFavorite(id: number) {
  return requestWithSignalr<{ favorited: boolean; favorites: number }>('ToggleCommunityThreadFavorite', {
    ThreadId: id,
  })
}

export async function toggleReplyLike(threadId: number, replyId: number) {
  void threadId
  return requestWithSignalr<{ liked: boolean; likes: number }>('ToggleCommunityReplyLike', {
    ReplyId: replyId,
  })
}

export async function getCommunityReplyChildren(req: GetCommunityReplyChildrenRequest) {
  return requestWithSignalr<{
    items: CommunityThreadReply[]
    page: CommunityThreadDetail['repliesPage']
  }>('GetCommunityReplyChildren', {
    ThreadId: req.threadId,
    ParentReplyId: req.parentReplyId,
    Page: Math.max(1, req.page ?? 1),
    Size: Math.max(1, req.size ?? 3),
  })
}

export async function getMyCommunityOverview(): Promise<CommunityMyOverview> {
  return requestWithSignalr<CommunityMyOverview>('GetMyCommunityOverview', {})
}
