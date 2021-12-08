import { RequestConfig } from '@/services/types'
import { getErrMsg } from '@/utils/getErrMsg'
import { stringifyQuery, LocationQueryRaw } from 'vue-router'
import ServerError from '@/services/internal/ServerError'

export const requestWithFetch = async <Param extends LocationQueryRaw, Data, Res>(
  url: string,
  options: RequestConfig<Param, Data> = {}
): Promise<Res> => {
  const fetchOpt: RequestInit = {
    method: options.method ?? 'GET'
  }
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  if (options.param) {
    const haveSearch = url.includes('?')

    if (haveSearch) {
      url += '&'
    } else {
      url += '?'
    }

    url += stringifyQuery(options.param)
  }

  if (options.data) {
    headers.append('Content-Type', 'application/json')
    fetchOpt.body = JSON.stringify(options.data)
  }

  if (options.signal) {
    fetchOpt.signal = options.signal
  }

  fetchOpt.headers = headers

  const res = await fetch(url, fetchOpt)

  /** 统一做json解码，非json的请求出现之后再考虑适配 */
  const content = await res.json()

  if (res.ok) {
    const { Success, Response, Status, Msg } = content

    if (Success) {
      return Response
    } else {
      throw new ServerError(Msg, Status)
    }
  }

  throw new Error(getErrMsg(content))
}
