import type { ShelfBookItem, ShelfFolderItem, ShelfItem } from '@/types/shelf'

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

export namespace ServerShelf {
  export interface BookItem extends Omit<ShelfBookItem, 'updateAt'> {
    updateAt: Date
  }
  export interface FolderItem extends Omit<ShelfFolderItem, 'updateAt'> {
    updateAt: Date
  }
  export type Item = BookItem | FolderItem
}
