import { ungzip } from 'pako'

import { unAuthenticationNotify } from '@/utils/biz/unAuthenticationNotify'
import { getErrMsg } from '@/utils/getErrMsg'

import { ServerError } from '@/services/ServerError'

import { requestQueue } from '../requestQueue'
import { ensureRealtimeConnection } from './connection'
import { createRealtimeTrace, flushRealtimeTrace, recordRealtimeTrace } from './trace'

import type { ApiEnvelope, HubRequestOptions } from '../types'

const DEFAULT_REQUEST_OPTIONS: HubRequestOptions = { UseGzip: true }

function isUnauthorizedError(error: unknown): boolean {
  return getErrMsg(error).includes('user is unauthorized')
}

function decodeResponse<Response>(response: Response | Uint8Array): Response {
  if (!(response instanceof Uint8Array)) return response
  return JSON.parse(ungzip(response, { toText: true })) as Response
}

async function sendHubRequest<Response>(
  methodName: string,
  params: object,
  options: HubRequestOptions,
): Promise<Response> {
  const trace = createRealtimeTrace(methodName, [params, options])

  try {
    const hub = await ensureRealtimeConnection()
    recordRealtimeTrace(trace, 'SENT', { params, options })
    const envelope = await hub.invoke<ApiEnvelope<Response | Uint8Array>>(methodName, params, options)
    const response = decodeResponse<Response>(envelope.Response)
    if (!envelope.Success) throw new ServerError(envelope.Msg, envelope.Status)

    recordRealtimeTrace(trace, 'SUCCESS', { ...envelope, Response: response })
    flushRealtimeTrace(trace)
    return response
  } catch (error) {
    recordRealtimeTrace(trace, 'FAIL', error)
    flushRealtimeTrace(trace)
    if (isUnauthorizedError(error)) unAuthenticationNotify.notify()
    throw error
  }
}

export function invokeHub<Response = unknown>(
  methodName: string,
  params: object = {},
  options: Partial<HubRequestOptions> = {},
): Promise<Response> {
  return requestQueue.add(() =>
    sendHubRequest<Response>(methodName, params, { ...DEFAULT_REQUEST_OPTIONS, ...options }),
  )
}
