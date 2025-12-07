import type { WithResolversReturn } from 'src/utils/withResolvers'
import { withResolvers } from 'src/utils/withResolvers'

type ParallelLimiterConfig = {
  /** 并发数 */
  parallelism: number
}

type ParallelLimiterInst = {
  acquire(): ParallelLimiterLocker
}

type ParallelLimiterLocker = {
  ready: Promise<void>

  release(): void
}

type ParallelLimiterInternalState = {
  total: number
  used: number

  running: WeakSet<Promise<void>>
  /** FIFO 队列 */
  wait: WithResolversReturn<void>[]
}

/** 根据 state 进行队列消费
 *
 * @description
 * 把 used 放 comsume 内实现，避免 acquire/release 里重复代码
 *
 * @description
 * 把 state 放入参纯粹为了降低
 */
function comsume(state: ParallelLimiterInternalState) {
  if (state.used >= state.total) return

  const next = state.wait.shift()
  if (!next) return

  // 这几个调用都是内部实现，没有报错可能
  // 省掉了复杂的 原子性 逻辑实现
  state.running.add(next.promise)
  state.used += 1
  next.resolve()
}

function createParallelLimiter(cfg: ParallelLimiterConfig): ParallelLimiterInst {
  const state: ParallelLimiterInternalState = {
    /** @alias parallelism */
    total: cfg.parallelism,
    used: 0,

    running: new WeakSet(),
    wait: [],
  }

  /** inst mean instance */
  const inst: ParallelLimiterInst = {
    acquire(): ParallelLimiterLocker {
      const resolver = withResolvers<void>()

      const locker: ParallelLimiterLocker = {
        ready: resolver.promise,

        release() {
          // waiting: 直接移除
          const idx = state.wait.indexOf(resolver)
          if (idx > -1) {
            // 直接移除等待
            const [item] = state.wait.splice(idx, 1)

            // 防呆: 保证 ready 不会被意外 resolve
            item.reject()

            return
          }

          const promise = locker.ready

          // double-release: 忽略
          if (!state.running.has(promise)) {
            return
          }

          // 确实在running中，正常释放
          state.running.delete(promise)
          state.used -= 1

          // 继续消费队列
          comsume(state)
        },
      }

      // 统一压入队列等待消费
      state.wait.push(resolver)

      // 保证初次启动
      comsume(state)

      return locker
    },
  }

  return inst
}

/**
 * @example
 * ```ts
 * import { parallelLimiter } from '.'
 *
 * async function () {
 *   const locker = parallelLimiter.acquire()
 *
 *   try {
 *      await locker.ready;
 *     // 执行并发受限的操作
 *   } finally {
 *     locker.release()
 *   }
 * }
 * ```
 */
const parallelLimiter = createParallelLimiter({ parallelism: 6 })

export { parallelLimiter }
export type { ParallelLimiterInst }
