import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './types'

export async function getForumList(req: Types.GetForumList.Request) {
  return requestWithSignalr('GetForumList', req)
}

export async function getForumInfo(req: Types.GetForumInfo.Request) {
  return requestWithSignalr('GetForumInfo', req)
}
