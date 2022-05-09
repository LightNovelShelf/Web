import * as Types from './types'
import { requestWithSignalr } from 'src/services/internal/request'

export async function getForumList(req: Types.GetForumList.Request) {
  return requestWithSignalr('GetForumList', req)
}
