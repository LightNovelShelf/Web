import type { ListResult } from '../types'

export enum ForumType {
  Anime = 'Anime',
  Comic = 'Comic',
  Game = 'Game',
  Novel = 'Novel',
  Website = 'Website',
}

export namespace GetForumList {
  export interface Request {
    Page: number
    Size: number
    ForumType: ForumType
  }
  export type Response = ListResult<any>
}

export namespace GetForumInfo {
  export interface Request {
    Id: number
  }
  export type Response = any
}
