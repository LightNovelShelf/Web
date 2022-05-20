import * as Types from './types'
import { requestWithSignalr } from 'src/services/internal/request'

export async function getForumList(req: Types.GetForumList.Request) {
  return requestWithSignalr('GetForumList', req)
}

export async function getForumInfo(req: Types.GetForumInfo.Request) {
  return requestWithSignalr('GetForumInfo', req)
}
