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

// 之前signal的message pack协议会自动 parse iso字符串为Date，现在改传gzip后的json字符串，没这个处理了
// export namespace ServerShelf {
//   export interface BookItem extends Omit<ShelfBookItem, 'updateAt'> {
//     updateAt: Date | string
//   }
//   export interface FolderItem extends Omit<ShelfFolderItem, 'updateAt'> {
//     updateAt: Date | string
//   }
//   export type Item = BookItem | FolderItem
// }
