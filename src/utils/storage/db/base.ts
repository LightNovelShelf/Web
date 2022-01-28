import localforage from 'localforage'
import { toRaw } from 'vue'

if (!window.indexedDB) {
  throw new Error('unsupport browser')
}

/** 应用版本；版本变更时会清空上一版本的数据库 */
// const APP_VER: number = +VUE_APP_VER
/** APP实例tag，用来方便同域名调试不同实例 */
const APP_NAME: string = VUE_APP_NAME || 'eBook_Shelf'

/**
 * 储存数据库元数据的数据库
 *
 * @description
 * 因为 localforage 的getItem操作是异步操作，没法在 DB 的 constructor 里完成操作
 * 所以这里用 localStorage 起了个简单的轮子
 */
class MetaDB {
  private config: Record<string, { version?: number }> = {}
  private static NAME = APP_NAME + '__DB_META'

  constructor() {
    try {
      this.config = JSON.parse(localStorage.getItem(MetaDB.NAME) ?? '{}')
    } catch (e) {
      this.config = {}
      localStorage.setItem(MetaDB.NAME, JSON.stringify(this.config))
    }
  }

  // 这里使用setVer而不是setItem是因为现在场景比较简单，直接setVer简化概念与类型声明
  // 以后有多个key设置时再另外写具体逻辑（包括各个key的空值适配等）

  /** 设置版本 */
  public setDBVer(DB_NAME: string, ver: number): void {
    if (!this.config[DB_NAME]) {
      this.config[DB_NAME] = {}
    }
    this.config[DB_NAME].version = ver
    localStorage.setItem(MetaDB.NAME, JSON.stringify(this.config))
  }
  /** 读取版本 */
  public getDBVer(DB_NAME: string): number {
    return this.config[DB_NAME]?.version ?? 1
  }

  private static _instance: MetaDB | null = null
  /** 获取MetaDB的实例；写成这个形式的好处是懒初始化 */
  static getInstance(): MetaDB {
    if (!MetaDB._instance) {
      MetaDB._instance = new MetaDB()
    }
    return MetaDB._instance
  }
}

export class DB<Value = unknown> {
  /** 返回一个DB实例 */
  private static createInstance(name: string, VER: number, DB_DESC: string) {
    return localforage.createInstance({
      /** 库名, 一个应用一个库 */
      name: APP_NAME,
      /** 表名 */
      storeName: name,
      version: VER,
      description: DB_DESC,
      driver: localforage.INDEXEDDB
    })
  }

  /** 当前版本 */
  private static readonly CURRENT_VER = 1

  /** db实例 */
  private db: LocalForage

  constructor(
    /** DB名，需要保证全局唯一 */
    DB_NAME: string,
    /** DB描述 */
    DB_DESC = ''

    /** db配置 */
    // config?: {}
  ) {
    // 就算相同也要set一次，保证初版应用也能记录到
    MetaDB.getInstance().setDBVer(DB_NAME, DB.CURRENT_VER)

    this.db = DB.createInstance(DB_NAME, DB.CURRENT_VER, DB_DESC)
  }

  /** 获取DB储存 */
  public get = <T = Value>(key: string): Promise<T | null> => {
    return this.db.getItem<T>(key)
  }
  /** 更新DB储存 */
  public set = async <T = Value>(key: string, val: T): Promise<void> => {
    // 因为同步的时候经常是vue对象来的，所以这里加点便捷操作，包了toRaw操作免得忘了之后debug
    await this.db.setItem(key, toRaw(val))
  }
  /** 移除DB中某一项目 */
  public remove = (key: string): Promise<void> => {
    return this.db.removeItem(key)
  }
  /** 清空DB */
  public clear = (): Promise<void> => {
    return this.db.clear()
  }
  /** 列出DB中所有的储存项名称 */
  public keys = (): Promise<string[]> => {
    return this.db.keys()
  }
  /** 迭代DB中的所有项目 @private 因为这个API没想到能直接用的场景，同时也跟 localforage 有绑定，所以暂不导出 */
  private iterate: (cb: (value: Value, key: string, idx: number) => void) => Promise<void> = (cb) => {
    return this.db.iterate((value: any, key: string, idx: number) => {
      // localforage.iterate的cb会接受返回值并据此决定是否提早结束迭代
      // 因为这个规则不太容易记住且容易误用，故这里强制吃掉cb的任何返回
      cb(value, key, idx)
    })
  }

  /** 获取DB中所有的项目 */
  public length = (): Promise<number> => {
    return this.db.length()
  }

  /** 获取DB中所有的项目 */
  public getItems = async <T = Value>(): Promise<T[]> => {
    const list: any[] = []

    await this.iterate((item) => list.push(item))

    return list
  }
}
