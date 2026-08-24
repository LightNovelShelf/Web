import { createSharedComposable, useNow } from '@vueuse/core'

/**
 * 全站共享的「现在」
 *
 * @description
 * 相对时间（xx分钟前）到处都要用，每个调用点各开一个定时器既费电又不同步。
 * createSharedComposable 让所有调用点共用同一份实例：第一个使用者创建定时器，
 * 最后一个使用者卸载时自动停掉。
 *
 * 刷新间隔 10 秒：toNow 的输出粒度是分钟级以上，只有「x秒前」这一档能看出滞后。
 */
export const useSharedNow = createSharedComposable(() => useNow({ interval: 10_000 }))
