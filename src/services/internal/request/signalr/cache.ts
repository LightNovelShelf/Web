import { ref } from 'vue'
import { signalrCacheDB } from 'src/utils/storage/db'

/** 最后一次返回的响应，目前用于监听cache使用情况 */
export const lastResponseCache = ref<Promise<unknown> | null>(null)

/** 查询cache返回结果 */
export async function tryResponseFromCache<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> {
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
  const key = JSON.stringify({ url, data })
  signalrCacheDB.set(key, res)
}
