import { RateLimitQueue } from 'src/utils/rateLimitQueue'

/**
 * 速度限制队列
 *
 * @description
 * 服务器原始设置的最高速率时 每5秒10个请求
 * 考虑到浏览器的计时不稳定等可能性，这里将相关数值缩放一次，避免意外
 */
export function createRequestQueue() {
  return new RateLimitQueue(10 - 1, 5 * 1000 * 1.1)
  // return new RateLimitQueue(1, 5 * 1000)
}

// export const queue = getQueue()
