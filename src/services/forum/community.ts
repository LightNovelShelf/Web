import { invokeHub } from '@/services/transport'

import type {
  CommunityCatalogPayload,
  CommunityFeedPayload,
  CommunityHomePayload,
  CommunityListQuery,
  CommunityMyOverview,
  CommunityThreadDetail,
  CommunityThreadEditInfo,
  CommunityThreadReply,
  CreateCommunityReplyRequest,
  CreateCommunityThreadRequest,
  GetCommunityReplyChildrenRequest,
  UpdateCommunityThreadRequest,
} from './types'
import type { EditorFormat } from '@/services/types'

export async function getCommunityHome(query: CommunityListQuery = {}): Promise<CommunityHomePayload> {
  return invokeHub<CommunityHomePayload>('GetCommunityHome', {
    BoardKey: query.boardKey ?? 'all',
    SubCategoryKey: query.subCategoryKey ?? '',
    Order: query.order ?? 'reply',
    Scope: query.scope ?? 'all',
    Page: Math.max(1, query.page ?? 1),
    Size: Math.max(1, query.size ?? 6),
  })
}

export async function getCommunityFeed(query: CommunityListQuery = {}): Promise<CommunityFeedPayload> {
  return invokeHub<CommunityFeedPayload>('GetCommunityFeed', {
    BoardKey: query.boardKey ?? 'all',
    SubCategoryKey: query.subCategoryKey ?? '',
    Order: query.order ?? 'reply',
    Scope: query.scope ?? 'all',
    Page: Math.max(1, query.page ?? 1),
    Size: Math.max(1, query.size ?? 6),
  })
}

export async function getCommunityCatalog(): Promise<CommunityCatalogPayload> {
  return invokeHub<CommunityCatalogPayload>('GetCommunityCatalog', {})
}

export async function getCommunityThread(
  id: number,
  replyPage = 1,
  replySize = 5,
  options: { trackView?: boolean; focusReplyId?: number } = {},
): Promise<CommunityThreadDetail | null> {
  return invokeHub<CommunityThreadDetail | null>('GetCommunityThread', {
    ThreadId: id,
    ReplyPage: Math.max(1, replyPage),
    ReplySize: Math.max(1, replySize),
    TrackView: options.trackView ?? replyPage === 1,
    FocusReplyId: Math.max(0, options.focusReplyId ?? 0),
  })
}

/** 编辑帖子用：只取编辑器要的字段，markdown 时正文由服务端转换 */
export async function getCommunityThreadEditInfo(
  id: number,
  format: EditorFormat = 'html',
): Promise<CommunityThreadEditInfo> {
  return invokeHub<CommunityThreadEditInfo>('GetCommunityThreadEditInfo', {
    ThreadId: id,
    Format: format,
  })
}

export async function createCommunityThread(req: CreateCommunityThreadRequest): Promise<CommunityThreadDetail> {
  return invokeHub<CommunityThreadDetail>('CreateCommunityThread', {
    BoardKey: req.boardKey,
    SubCategoryKey: req.subCategoryKey ?? '',
    Title: req.title,
    ContentHtml: req.contentHtml,
  })
}

export async function updateCommunityThread(req: UpdateCommunityThreadRequest): Promise<{ Id: number }> {
  return invokeHub<{ Id: number }>('UpdateCommunityThread', {
    ThreadId: req.threadId,
    BoardKey: req.boardKey,
    SubCategoryKey: req.subCategoryKey ?? '',
    Title: req.title,
    ContentHtml: req.contentHtml,
  })
}

export async function deleteCommunityThread(threadId: number): Promise<{ Id: number }> {
  return invokeHub<{ Id: number }>('DeleteCommunityThread', { ThreadId: threadId })
}

export async function setCommunityThreadLocked(
  threadId: number,
  locked: boolean,
): Promise<{ Id: number; Locked: boolean }> {
  return invokeHub<{ Id: number; Locked: boolean }>('SetCommunityThreadLocked', {
    ThreadId: threadId,
    Locked: locked,
  })
}

export async function createCommunityReply(req: CreateCommunityReplyRequest): Promise<CommunityThreadReply> {
  return invokeHub<CommunityThreadReply>('CreateCommunityReply', {
    ThreadId: req.threadId,
    Content: req.content,
    ReplyToId: req.replyToId,
  })
}

export async function deleteCommunityReply(replyId: number): Promise<{ Id: number; Removed: number }> {
  return invokeHub<{ Id: number; Removed: number }>('DeleteCommunityReply', { ReplyId: replyId })
}

export async function toggleThreadLike(id: number) {
  return invokeHub<{ Liked: boolean; Likes: number }>('ToggleCommunityThreadLike', {
    ThreadId: id,
  })
}

export async function toggleThreadFavorite(id: number) {
  return invokeHub<{ Favorited: boolean; Favorites: number }>('ToggleCommunityThreadFavorite', {
    ThreadId: id,
  })
}

export async function toggleReplyLike(threadId: number, replyId: number) {
  void threadId
  return invokeHub<{ Liked: boolean; Likes: number }>('ToggleCommunityReplyLike', {
    ReplyId: replyId,
  })
}

export async function getCommunityReplyChildren(req: GetCommunityReplyChildrenRequest) {
  return invokeHub<{
    Items: CommunityThreadReply[]
    Page: CommunityThreadDetail['RepliesPage']
  }>('GetCommunityReplyChildren', {
    ThreadId: req.threadId,
    ParentReplyId: req.parentReplyId,
    Page: Math.max(1, req.page ?? 1),
    Size: Math.max(1, req.size ?? 3),
    AfterReplyId: Math.max(0, req.afterReplyId ?? 0),
  })
}

export async function getMyCommunityOverview(): Promise<CommunityMyOverview> {
  return invokeHub<CommunityMyOverview>('GetMyCommunityOverview', {})
}
