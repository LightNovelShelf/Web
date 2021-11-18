import { DB } from '@/utils/storage/db'

/** 用来储存响应的DB */
const cacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')

/** 查询cache返回结果 */
export async function tryResponseFromCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> {
  const key = JSON.stringify({ url, data })
  const val = await cacheDB.get(key)
  if (val) {
    return val as Promise<any>
  }

  return Promise.reject('unfound')
}

/** 更新对应url的cache */
export function updateResponseCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  res: Res,
  ...data: Data
): void {
  const key = JSON.stringify({ url, data })
  cacheDB.set(key, res)
}
