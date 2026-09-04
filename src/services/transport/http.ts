import { stringifyQuery } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'

import { ServerError } from '@/services/ServerError'
import { RequestMethod } from '@/services/types'

import { requestQueue } from './requestQueue'
import { visitorId } from './visitorId'

import type { ApiEnvelope } from './types'
import type { RequestConfig } from '@/services/types'
import type { LocationQueryRaw } from 'vue-router'

async function sendHttpRequest<Response = unknown, Data = unknown>(
  requestUrl: string,
  options: RequestConfig<Data> = {},
): Promise<Response> {
  const method = options.method ?? RequestMethod.POST
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('x-id', await visitorId)

  const request: RequestInit = {
    method,
    headers,
    signal: options.signal,
  }

  if (method === RequestMethod.GET) {
    const query = stringifyQuery((options.payload ?? {}) as LocationQueryRaw)
    if (query) requestUrl += `${requestUrl.includes('?') ? '&' : '?'}${query}`
  } else if (method === RequestMethod.POST) {
    if (options.payload instanceof FormData) {
      request.body = options.payload
    } else {
      headers.set('Content-Type', 'application/json')
      request.body = JSON.stringify(options.payload)
    }
  } else {
    throw new Error(`unknown request method: ${String(method)}`)
  }

  const response = await fetch(requestUrl, request)
  const content = (await response.json().catch(() => null)) as ApiEnvelope<Response> | null

  if (!response.ok) {
    throw new ServerError(getErrMsg(content, `请求失败 (${response.status})`), content?.Status ?? response.status)
  }
  if (!content?.Success) {
    throw new ServerError(content?.Msg, content?.Status)
  }

  return content.Response
}

export function requestHttp<Response = unknown, Data = unknown>(
  url: string,
  options: RequestConfig<Data> = {},
): Promise<Response> {
  return requestQueue.add(() => sendHttpRequest<Response, Data>(url, options))
}
