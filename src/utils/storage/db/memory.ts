import { toRaw } from 'vue'

export class MemoryDB<Value = unknown> {
  /** db实例 */
  private db = {}

  /** 获取DB储存 */
  public get = <T = Value>(key: string): T | undefined => {
    return this.db[key]
  }
  /** 更新DB储存 */
  public set = <T = Value>(key: string, val: T): void => {
    // 因为同步的时候经常是vue对象来的，所以这里加点便捷操作，包了toRaw操作免得忘了之后debug
    this.db[key] = toRaw(val)
  }
  /** 移除DB中某一项目 */
  public remove = (key: string): void => {
    delete this.db[key]
  }
}
