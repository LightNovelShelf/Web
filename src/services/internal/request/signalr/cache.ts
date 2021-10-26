import { DB } from '@/utils/storage/db'

/** 用来储存响应的DB */
const cacheDB = new DB('SIGNALR_CACHE', '请求缓存储存')

/** 查询cache返回结果 */
export async function tryResponseFromCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> {
  /** @todo 应该还要想办法结合data来取值 */
  return cacheDB.get(url) as any
}
