import type { GetBookListRequest, GetBookListRes } from 'src/services/book/types'

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

export namespace Register {
  export interface Param {
    userName: string
    email: string
    password: string
    code: string
    inviteCode: string
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

export namespace GetMyBooks {
  export type Request = GetBookListRequest
  export type Response = GetBookListRes
}

export namespace QuickCreateBook {
  export interface Request {
    Title: string
    Author: string
    // 章节数量
    Count: number
    Cover: string
    Introduction: string
    CategoryId: number
  }
  export type Response = number
}

export namespace UploadImage {
  export interface Request {
    FileName: string
    ImageData: Uint8Array
  }
  export interface Response {
    Url: string
  }
}
