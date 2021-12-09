import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { ref } from 'vue'
import { ServerError } from '@/services/internal/ServerError'

import { tryResponseFromCache, updateResponseCache } from './cache'
import { longTermToken, sessionToken } from '@/utils/session'
import { refreshToken } from '@/services/user'

/** signalr接入点 */
const HOST = `${VUE_APP_API_SERVER}/hub/api`

/** @internal 记录Promise避免重复start */
export const connectPromise = ref<null | Promise<HubConnection>>(null)
/** @internal signalr连接情况标志 */
export const isConnected = ref<boolean>(false)
/** 最后一次重连定时器句柄 */
const lastReConnect = ref<number>(0)

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
          token = await refreshToken('' + _token)
        }
      }
      return token
    }
  })
  .withHubProtocol(new MessagePackHubProtocol())
  .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Critical)
  .build()

/** 断联时更新连接情况 */
hub.onclose(() => {
  isConnected.value = false
  reConnectLater()
})

/** 延时重连 */
function reConnectLater() {
  // 1. 如果已经有重连定时器，就不用覆盖设置了
  if (lastReConnect.value) {
    return
  }

  // 2. 没有已有的重连定时器，新建一个
  lastReConnect.value = setTimeout(getSignalr, 10 * 1000) as unknown as number
}

/** 返回一个 signalr 连接中心 */
function getSignalr(): Promise<HubConnection> {
  /** 清空重连定时器记录 */
  clearTimeout(lastReConnect.value)
  lastReConnect.value = 0

  /** 如果实例已连接 */
  if (isConnected.value) {
    return Promise.resolve(hub)
  }

  /** 否则检查是否有正在进行的连接 */
  if (!connectPromise.value) {
    connectPromise.value = hub.start().then(() => hub)

    /** 记录已连接标志 */
    connectPromise.value.then(() => (isConnected.value = true))
    /** start抛出错误后，安排重连 */
    connectPromise.value.catch(reConnectLater)
    /** start完成后清除Promise，避免掉线重连时发现有Promise就不执行重连操作 */
    connectPromise.value.finally(() => {
      connectPromise.value = null
    })
  }

  return connectPromise.value
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

  if (!isConnected.value) {
    try {
      return await tryResponseFromCache(url, ...data)
    } catch (e) {
      // 如果没有cache；吞掉这个错误，走正常的请求流程
    }
  }

  const res = await (await getSignalr()).invoke(url, ...data)
  const { Success, Response, Status, Msg } = res

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
    updateResponseCache(url, Response, ...data)
    return Response
  } else if (Msg || Status !== null) {
    throw new ServerError(Msg, Status)
  }

  // @todo 暂不确定请求失败后是否使用缓存代替：
  // 如果有两个接口的内容互为呼应，前一个请求成功，是更新后的内容，而后一个请求失败，如果回退使用缓存则可能会出现内容之间脱钩的问题

  throw new Error(Msg || '未知服务错误')
}

export function subscribeWithSignalr<Res = unknown>(methodName: string, cb: (res: Res) => void) {
  let _cb = cb
  if (__DEV__ && VUE_TRACE_SERVER) {
    _cb = (res: Res): void => {
      console.groupCollapsed(`signalr subscribe data trace: '${methodName}'`)
      console.log('reviced:', res)
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
