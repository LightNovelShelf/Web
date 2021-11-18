import localforage from 'localforage'

if (!window.indexedDB) {
  throw new Error('unsupport browser')
}

/** APP实例tag，用来方便同域名调试不同实例 */
const TAG: string = process.env.VUE_APP_TAG || 'eBook_Shelf'

export class DB {
  /** 返回一个DB实例 */
  private static createDB(VER: number, DB_DESC: string) {
    return localforage.createInstance({
      version: VER,
      description: DB_DESC,
      driver: localforage.INDEXEDDB
    })
  }

  /** 当前版本 */
  private static readonly CURRENT_VER: number = +process.env.VUE_APP_VER

  /** db实例 */
  private db: LocalForage

  constructor(
    /** DB名，需要保证全局唯一 */
    DB_NAME: string,
    /** DB描述 */
    DB_DESC = ''
  ) {
    /** 存储DB版本号的STORAGE_KEY */
    const LAST_VER_STORAGE_KEY = TAG + '_DB_VER_' + DB_NAME

    /** 客户端已有的DB版本 */
    const LAST_VER = +(localStorage.getItem(LAST_VER_STORAGE_KEY) || DB.CURRENT_VER)

    /** 查询是否有现存的DB */
    if (LAST_VER && LAST_VER !== DB.CURRENT_VER) {
      DB.createDB(LAST_VER, DB_DESC).clear()
    }

    localStorage.setItem(LAST_VER_STORAGE_KEY, DB.CURRENT_VER.toString())
    this.db = DB.createDB(DB.CURRENT_VER, DB_DESC)
  }

  /** 获取DB储存 */
  public get = (key: string) => {
    return this.db.getItem(key)
  }
  /** 获取DB储存 */
  public set = (key: string, val: any) => {
    return this.db.setItem(key, val)
  }
}
