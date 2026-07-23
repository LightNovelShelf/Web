import { ref } from 'vue'

import { signalrCacheDB } from 'src/utils/storage/db'

/** 最后一次返回的响应，目前用于监听cache使用情况 */
export const lastResponseCache = ref<Promise<unknown> | null>(null)

/**
 * 缓存黑名单：写入/变更类接口，其响应不应被缓存
 *
 * 这些接口要么是提交操作（离线返回旧缓存会造成“伪成功”），
 * 要么响应内容一次性、无复用价值。命中黑名单时既不读也不写缓存。
 */
const CACHE_BLACKLIST = new Set<string>([
  'ClearReadHistory',
  'CreateCommunityReply',
  'CreateCommunityThread',
  'CreateNewComicChapter',
  'CreateNewNovelChapter',
  'DeleteBook',
  'DeleteChapter',
  'DeleteComment',
  'MarkNotifications',
  'PostComment',
  'QuickCreateComic',
  'QuickCreateNovel',
  'ReorderChapter',
  'ReplyComment',
  'SaveBookShelf',
  'SaveReadPosition',
  'SetAvatar',
  'ToggleCommunityReplyLike',
  'ToggleCommunityThreadFavorite',
  'ToggleCommunityThreadLike',
  'UpdateBook',
  'UpdateComicChapter',
  'UpdateNovelChapter',
  'UploadImage',
])

/** 该接口是否允许缓存 */
export const isCacheable = (url: string): boolean => !CACHE_BLACKLIST.has(url)

/** 查询cache返回结果 */
export async function tryResponseFromCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> {
  if (!isCacheable(url)) return Promise.reject('no found')

  const key = JSON.stringify({ url, data })
  const val = await signalrCacheDB.get(key)
  if (val) {
    // 每次DB.get拿到的数据都是引用不相等的
    // await cacheDB.get('test') !== await cacheDB.get('test')
    // 所以直接赋值就能让外部感知值已经修改过
    lastResponseCache.value = val as Promise<any>
    return val as Promise<any>
  }

  return Promise.reject('no found')
}

/** 更新对应url的cache */
export function updateResponseCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  res: Res,
  ...data: Data
): void {
  if (!isCacheable(url)) return

  const key = JSON.stringify({ url, data })
  signalrCacheDB.set(key, res)
}
