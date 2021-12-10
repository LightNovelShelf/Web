export namespace Login {
  export interface Param {
    email: string
    password: string
    token: string
  }

  export interface Res {
    RefreshToken: string
    Token: string
  }
}

export namespace RefreshToken {
  export interface Param {
    token: string
  }
  export type Res = string
}
