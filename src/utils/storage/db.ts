import localforage from 'localforage'

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

export class DB {
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
  public get<T>(key: string) {
    return this.db.getItem<T>(key)
  }
  /** 更新DB储存 */
  public set = (key: string, val: any) => {
    return this.db.setItem(key, val)
  }
}
