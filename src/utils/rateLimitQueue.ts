import type { AnyAsyncFunc, AnyVoidFunc } from '@/types/utils'
// import { sleep } from './sleep'

const now = performance.now.bind(performance) || Date.now.bind(Date)

/** 调用频率限制队列 */
export class RateLimitQueue {
  constructor(
    /** 最多多少个请求 */
    private readonly max: number,
    /** 在多少时间的周期内 @default 1000 默认1秒 */
    private readonly perMs: number = 1000
  ) {
    if (this.max <= 0) {
      throw new Error('max must bigger than 0')
    }
    if (this.perMs <= 100) {
      throw new Error('perMs must bigger than 100')
    }

    // 取平均数的一半为间隔，最低值10
    this.tick = Math.max(10, Math.floor(this.perMs / this.max / 2))
  }

  /** 检查间隔 */
  private tick = 10
  /** 正在排队的队列 */
  private pending: AnyVoidFunc[] = []
  /** 正在运行的队列的加入时间 */
  private pool: number[] = []

  /** 获取队列长度 */
  public get size() {
    return this.pending.length
  }

  public add = <Fn extends AnyAsyncFunc, Return = Awaited<ReturnType<Fn>>>(fn: Fn): Promise<Return> => {
    return new Promise<Return>((resolve, reject) => {
      this.pending.push(() => {
        try {
          fn().then(resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
      this.run()
    })
  }

  private lastRunCheck = 0

  /** 如果有空位就安排一次函数调用 */
  private run = () => {
    if (!this.pending.length) {
      return
    }

    const time = now()

    // 把符合间隔条件的都清出去
    while (this.pool[0] && time - this.pool[0] > this.perMs) {
      this.pool.shift()
    }

    // 填满pool
    while (this.pending.length && this.pool.length < this.max) {
      // shift一个函数出来并运行
      this.pending.shift()!()

      // 在这里push进去的一定要即时取值，不能用缓存的值；
      // 如果用缓存的值，值取早了，校验的时候就可能意外通过了更多的函数，导致频率超过限制
      this.pool.push(now())
    }

    // 如果填充过后还有，异步计时
    if (this.pending.length) {
      // 需要清除，防止快速add 超过 this.max 个时重复定时
      // cancelAnimationFrame(this.lastRunCheck)
      // this.lastRunCheck = requestAnimationFrame(this.run)
      clearTimeout(this.lastRunCheck)
      this.lastRunCheck = setTimeout(this.run, this.tick) as unknown as number
    }
  }
}

// // 校验函数；@todo 写成 .test.ts
// ;(async function test() {
//   const [max, perMs] = [10, 5000]
//   const queue = new RateLimitQueue(max, perMs)
//   /** 异步运行的时候去这里取一次值，验证自己比10的那次已经晚了指定间隔 */
//   const runTimeCache = new Map<number, number>()

//   for (const _key of new Array(max * 5).keys()) {
//     const key = _key + 1
//     console.log(`RateLimitQueue.debug.addAt: ${key}`, ~~now())
//     queue.add(async () => {
//       const time = ~~now()
//       // 每10个应该一块运行（尽早发出）；数组的第二项理应比perMs大且（误差范围内）刚刚好
//       console.log(`RateLimitQueue.debug.runAt: ${key}`, [time, time - (runTimeCache.get(key - max) ?? time)])
//       runTimeCache.set(key, time)
//       await sleep(2000)
//     })
//   }
// })()
