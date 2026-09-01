/** 积分/成长等级相关接口类型；字段为 PascalCase，直接映射后端返回 */

/** 成长摘要，随 GetMyInfo 一并返回，挂在 user.Growth 上 */
export interface Growth {
  /** 累计经验值 */
  Exp: number
  /** 金币余额，用于下载消费 */
  Coin: number
  /** 当前访问等级（含手动授予，用于展示） */
  Level: number
  /** 由经验值算出的成长等级 */
  GrowthLevel: number
  /** 当前等级门槛经验 */
  CurrentLevelExp: number
  /** 下一等级门槛经验，满级为 null */
  NextLevelExp: number | null
  /** 连续签到天数 */
  SignStreak: number
  /** 今日是否已签到 */
  TodaySigned: boolean
}

export namespace SignIn {
  export type Request = Record<string, never>
  export interface Response {
    Reward: number
    CoinReward: number
    Streak: number
    Exp: number
    Coin: number
    Level: number
  }
}

export namespace GetPointLog {
  export interface Request {
    Page: number
    Size: number
  }
  export interface Item {
    Source: string
    SourceLabel: string
    Amount: number
    Balance: number
    RefId: number | null
    OccurredAt: string
  }
  export interface Response {
    TotalPages: number
    Page: number
    Data: Item[]
  }
}

/** 金币流水，结构与积分流水一致，仅来源枚举多出消费类 */
export namespace GetCoinLog {
  export type Request = GetPointLog.Request
  export type Item = GetPointLog.Item
  export type Response = GetPointLog.Response
}

export namespace GetSignInCalendar {
  export interface Request {
    Year: number
    Month: number
  }
  export interface Day {
    SignDate: string
    Streak: number
    Reward: number
  }
  export interface Response {
    Year: number
    Month: number
    Days: Day[]
  }
}
