import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { ref } from 'vue'
import { ServerError } from '@/services/internal/ServerError'

import { tryResponseFromCache, updateResponseCache } from './cache'
import { longTermToken, sessionToken } from '@/utils/session'
import { refreshToken } from '@/services/user'
import { getErrMsg } from '@/utils/getErrMsg'
import { unAuthenticationNotify } from '@/utils/biz/unAuthenticationNotify'
import { AppVisibility } from 'quasar'
import { RetryPolicy } from '@/services/internal/request/signalr/RetryPolicy'

/** signalr接入点 */
const HOST = `${VUE_APP_API_SERVER}/hub/api`
/** 是否是未授权产生的signalr错误 */
const IS_UN_AUTH_ERR = (err: unknown): boolean =>
  /** @todo 未授权没有别的特征，只有通过message来检查 */ getErrMsg(err).includes('user is unauthorized')

export const connectState = ref<HubConnectionState>(HubConnectionState.Disconnected)
/** 最后一次重连定时器句柄 */
const lastReConnect = ref<number>(0)
const isStart = ref<boolean>(false)

/** signalr 连接中心 */
const hub: HubConnection = new HubConnectionBuilder()
  .withUrl(HOST, {
    async accessTokenFactory() {
      // 查询是否已有会话token
      let token = sessionToken.get()
      if (!token) {
        // 如果没有,查询是否有 longTermToken
        const _token = await longTermToken.get()
        // 如果有, 用它来换取会话token
        if (_token) {
          try {
            token = await refreshToken('' + _token)
          } catch (error) {
            // -100 token失效, 404 token不存在
            if (error instanceof ServerError && [-100, 404].includes(error.status)) {
              await longTermToken.set('')
            }
          }
          // 目前token只有一次性用途，这里用完就删，以后可能有反复请求的用途
          sessionToken.set('')
        }
      }
      return token
    }
  })
  .withAutomaticReconnect(new RetryPolicy())
  .withHubProtocol(new MessagePackHubProtocol())
  .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Critical)
  .build()

const setState = () => (connectState.value = hub.state)
hub.onclose(setState)
hub.onreconnecting(setState)
hub.onreconnected(setState)

window['hub'] = hub
window['connectState'] = connectState

/** 返回一个 signalr 连接中心 */
function getSignalr(): Promise<HubConnection> {
  if (isStart.value) {
    return Promise.resolve(hub)
  } else {
    isStart.value = true
    const startPromise = hub.start().then(() => hub)
    startPromise.catch(() => {
      lastReConnect.value = setInterval(() => {
        hub.start().then(() => clearInterval(lastReConnect.value))
      }, 15000) as unknown as number
    })
    /** 记录已连接标志 */
    startPromise.then(setState)
    return startPromise
  }
}

/** 立即运行一次保证连接ws服务器，并记录成Promise */
const firstConnect: () => Promise<HubConnection> = (() => {
  let context: Promise<HubConnection>
  return () => {
    if (!context) {
      context = getSignalr()
    }
    return context
  }
})()

/** 强制断开当前连接 */
export async function rebootSignalr() {
  await hub.stop()
  clearInterval(lastReConnect.value)
  isStart.value = false
  await getSignalr()
}

/**
 * 通过 signalr 发送请求
 *
 * @internal
 *
 * @url https://github.com/LightNovelShelf/Web/issues/7
 *
 * @description
 * 1. 保证首次connect期间不读取缓存
 * 2. 读取连接状态，如果断联就检查缓存
 *
 * 3.1. 如果缓存读取成功，返回
 *
 * 3.2. 如果缓存失效，等待 signalr 连接成功后invoke请求
 *
 * 3.2.1. 请求成功，更新缓存并返回结果
 * 3.2.2. 请求失败，throw error
 */
export async function requestWithSignalr<Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> {
  // 等待第一次connect
  try {
    await firstConnect()
  } catch (e) {
    // 不需要管错误，这里只关注连过就好
  }

  if (connectState.value !== HubConnectionState.Connected) {
    try {
      return await tryResponseFromCache(url, ...data)
    } catch (e) {
      // 如果没有cache；吞掉这个错误，走正常的请求流程
    }
  }

  let Success, Response, Status, Msg

  // 处理请求本身就失败的情况（比如没授权）
  try {
    const res = await (await getSignalr()).invoke(url, ...data)
    ;({ Success, Response, Status, Msg } = res)
  } catch (e) {
    console.groupCollapsed(`signalr request data trace: '${url}'`)
    console.log('send:', [...data])
    console.log('err:', e)

    console.log('at:', new Date().toLocaleString())
    console.groupEnd()

    // 如果是未授权，通知一声
    if (IS_UN_AUTH_ERR(e)) {
      unAuthenticationNotify.notify()
    }

    // catch & throw;
    // 这个 try...catch 本意就是监听打点而已，不是真的想把错误catch住
    throw e
  }

  // 处理请求成功但响应内容提示失败的情况
  if (__DEV__ && VUE_TRACE_SERVER) {
    console.groupCollapsed(`signalr request data trace: '${url}'`)
    console.log('send:', [...data])
    console.log('Success:', Success)
    if (Success) {
      console.log('Response:', Response)
    } else {
      console.log('Status:', Status)
      console.log('Msg:', Msg)
    }
    console.log('at:', new Date().toLocaleString())
    console.groupEnd()
  }

  if (Success) {
    // 只在成功时储存这个response，在读取了cache之后还得判断是否有效；浪费一次读取行为
    // @todo 暂不确定请求失败后是否使用缓存代替：
    // 如果有两个接口的内容互为呼应，前一个请求成功，是更新后的内容，而后一个请求失败，如果回退使用缓存则可能会出现内容之间脱钩的问题
    updateResponseCache(url, Response, ...data)
    return Response
  } else {
    throw new ServerError(Msg, Status)
  }
}

export function subscribeWithSignalr<Res = unknown>(methodName: string, cb: (res: Res) => void) {
  let _cb = cb
  if (__DEV__ && VUE_TRACE_SERVER) {
    _cb = (res: Res): void => {
      console.groupCollapsed(`signalr subscribe data trace: '${methodName}'`)
      console.log('received:', res)
      console.log('at:', new Date().toLocaleString())
      console.groupEnd()
      cb(res)
    }
  }

  // 直接on就好
  hub.on(methodName, _cb)

  return function () {
    hub.off(methodName, _cb)
  }
}
