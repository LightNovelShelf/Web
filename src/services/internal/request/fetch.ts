import { RequestConfig } from '@/services/types'
import { getErrMsg } from '@/utils/getErrMsg'
import { stringifyQuery } from 'vue-router'
import { ServerError } from '@/services/internal/ServerError'
import { RequestMethod } from '@/services/types'
import { sessionToken } from '@/utils/session'

export async function requestWithFetch<Res = unknown, Data = any>(
  url: string,
  options: RequestConfig<Data> = {}
): Promise<Res> {
  // 补全默认值; 项目里绝大部分接口都是POST接口所以默认post了
  options.method = options.method ?? RequestMethod.POST

  const fetchOpt: RequestInit = {
    method: options.method
  }
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // 简化payload声明
  // get就只有param（浏览器发出请求时也会忽略get请求的body）
  // post就只有body（规定post请求不支持拼接参数到url上，要拼业务自己拼）
  switch (options.method) {
    case RequestMethod.GET: {
      // 由业务自己保证 payload 可以被序列化到url
      /** 请求参数 */
      const queryStr = stringifyQuery(options.payload as any)
      // 确定请求参数不为空再执行拼接操作
      if (queryStr) {
        const haveSearch = url.includes('?')
        if (haveSearch) {
          url += '&'
        } else {
          url += '?'
        }

        url += queryStr
      }
      break
    }
    case RequestMethod.POST: {
      headers.append('Content-Type', 'application/json')
      fetchOpt.body = JSON.stringify(options.payload)
      break
    }
    default: {
      throw new Error(`unknown request method: ${options.method}`)
    }
  }

  if (options.signal) {
    fetchOpt.signal = options.signal
  }

  fetchOpt.headers = headers

  const token = sessionToken.get()
  if (token) {
    /** @todo 目前的fetch都是无授权的, 稍后才知道真的token header是什么 */
    fetchOpt.headers.append('Authentication', `Bearer ${token}`)
  }

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

/** 附加在函数上导出，方便引用 */
requestWithFetch.RequestMethod = RequestMethod
