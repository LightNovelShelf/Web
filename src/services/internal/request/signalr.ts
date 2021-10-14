import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { ref } from 'vue'

/** signalr接入点 */
const HOST = `${process.env.VUE_APP_API_SERVER}/hub/api`

/** signalr 连接中心 */
const hub: HubConnection = new HubConnectionBuilder()
  .withUrl(HOST, {
    accessTokenFactory() {
      /** @todo 这里会循环引用，虽然能跑但有点丑陋；真要用到这个的话，要想个优雅点的办法 */
      return ''
    }
  })
  .withHubProtocol(new MessagePackHubProtocol())
  .configureLogging(LogLevel.Information)
  .build()

/** signalr连接情况标志 */
export const isConnected = ref<boolean>(false)
/** 断联时更新连接情况 */
hub.onclose(() => {
  isConnected.value = false
  reConnectLater()
})

/** 记录Promie避免重复start */
let connectPromise: null | Promise<HubConnection> = null

/** 失败重连等待的时长，ms */
const RECONNECT_TIMEOUT = 10 * 1000

/** 单例句柄，保险 */
let lastReConnect = 0
/** 延时重连 */
const reConnectLater = () => {
  if (lastReConnect) {
    clearTimeout(lastReConnect)
  }
  lastReConnect = setTimeout(() => {
    getSignalr()
    lastReConnect = 0
  }, RECONNECT_TIMEOUT) as unknown as number
}

/** 返回一个 signalr 连接中心 */
export const getSignalr = (): Promise<HubConnection> => {
  /** 如果实例已连接 */
  if (isConnected.value) {
    return Promise.resolve(hub)
  }

  /** 否则检查是否有正在进行的连接 */
  if (!connectPromise) {
    connectPromise = hub.start().then(() => hub)

    /** 记录已连接标志 */
    connectPromise.then(() => (isConnected.value = true))
    /** start抛出错误后，安排重连 */
    connectPromise.catch(reConnectLater)
    /** start完成后清除Promise，避免掉线重连时发现有Promise就不执行重连操作 */
    connectPromise.finally(() => {
      connectPromise = null
    })
  }

  return connectPromise
}

/** 通过 signalr 发送请求 */
export const requestWithSignalr = async <Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> => {
  const { Success, Response, Status, Msg } = await (await getSignalr()).invoke(url, ...data)
  if (Status === 200 && Success) {
    return Response
  }

  throw new Error(Msg || '未知服务错误')
}
