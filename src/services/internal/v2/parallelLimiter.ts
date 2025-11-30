import type { WithResolversReturn } from 'src/utils/withResolvers'
import { withResolvers } from 'src/utils/withResolvers'

type ParallelLimiterConfig = {
  /** 并发数 */
  parallelism: number
}

type ParallelLimiterInst = {
  lock(): ParallelLimiterContex
}

type ParallelLimiterContex = {
  // TODO: 需要记录更多信息逻辑才能自洽，比如消费了和还没消费的release是不一样的

  ready: Promise<void>

  release(): void
}

function createParallelLimiter(cfg: ParallelLimiterConfig): ParallelLimiterInst {
  const state = {
    /** @alias parallelism */
    p: 0,

    waitQueue: [] as ParallelLimiterContex[],
  }

  return {
    lock(): ParallelLimiterContex {
      const { promise, resolve } = withResolvers<void>()

      const context: ParallelLimiterContex = {
        ready: promise,

        release() {
          state.p -= 1
          if (state.p < 0) state.p = 0

          // 先进先出
          const next = state.waitQueue.shift()
          if (!next) return

          // next.
        },
      }

      if (state.p < cfg.parallelism) {
        state.p += 1
        resolve()
      } else {
        state.waitQueue.push(context)
      }

      return context
    },
  }
}

const parallelLimiter = createParallelLimiter({ parallelism: 6 })

export { parallelLimiter }
export type { ParallelLimiterInst }
