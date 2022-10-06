import { AnyFunc } from '../types/utils'

export class SaveManager {
  private static _instance?: SaveManager
  public static get instance(): SaveManager {
    if (this._instance !== undefined) return this._instance
    this._instance = new SaveManager()
    return this._instance
  }

  func?: AnyFunc
  hooked: boolean
  public remove() {
    document.removeEventListener('keydown', this.listen)
    this.hooked = false
  }

  private add() {
    if (!this.hooked) {
      document.addEventListener('keydown', this.listen)
    }
    this.hooked = true
  }

  public useSave(fun: AnyFunc) {
    this.add()
    this.func = fun
  }

  listen = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      // 执行save方法
      if (this.func !== undefined) this.func.call(this)
      // 阻止默认事件
      e.preventDefault()
    }
  }

  constructor() {
    this.hooked = false
  }
}
