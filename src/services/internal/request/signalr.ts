import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'

/** signalr接入点 */
const HOST = `${process.env.VUE_APP_API_SERVER}/hub/api`

/** 缓存 HubConnection，当初始化或者链接失效时置为null */
let connection: null | HubConnection = null
/** 记录Promie避免多次发起链接 */
let connectPromise: null | Promise<HubConnection> = null

class SignalrEvtEmiter {
  private connectedListeners = new Set<() => void>()
  private closeListeners = new Set<() => void>()
  private statusChangeListeners = new Set<(connected: boolean) => void>()
  private lastConnected = false

  public started() {
    this.connectedListeners.forEach((cb) => cb())
    this.statusChangeListeners.forEach((cb) => cb(true))
    this.lastConnected = true
  }
  public closed() {
    this.closeListeners.forEach((cb) => cb())
    this.statusChangeListeners.forEach((cb) => cb(false))
    this.lastConnected = false
  }
  public lastConnectedStatus = () => {
    return this.lastConnected
  }

  public onStart(cb: () => void) {
    this.connectedListeners.add(cb)
    return () => {
      this.connectedListeners.delete(cb)
    }
  }
  public onClose(cb: () => void) {
    this.closeListeners.add(cb)
    return () => {
      this.closeListeners.delete(cb)
    }
  }
  public onStatusChange(cb: (connected: boolean) => void) {
    this.statusChangeListeners.add(cb)
    return () => {
      this.statusChangeListeners.delete(cb)
    }
  }
}

/** signalr事件监听 */
export const signalrEvtEmiter = new SignalrEvtEmiter()

/** 返回一个 signalr 实例 */
export const getSignalr = (): Promise<HubConnection> => {
  if (connection) {
    return Promise.resolve(connection)
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      /** 初始化 HubConnection */
      const hub = new HubConnectionBuilder()
        .withUrl(HOST)
        .withHubProtocol(new MessagePackHubProtocol())
        .configureLogging(LogLevel.Information)
        .build()

      /** 并待其start完成 */
      await hub.start()
      signalrEvtEmiter.started()

      return hub
    })()

    /** 待start完成后记录 清除Promise，避免掉线重连时发现有Promise就不执行重连操作 */
    connectPromise.finally(() => {
      connectPromise = null
    })

    /** 待start完成后记录 HubConnection，不再重复初始化 */
    connectPromise.then((hub) => {
      connection = hub
      /** 意外关闭时清除缓存 */
      connection.onclose(() => {
        connection = null
        signalrEvtEmiter.closed()
      })
    })
  }

  return connectPromise
}

export const requestWithSignalr = async <Res = unknown, Data extends unknown[] = unknown[]>(
  url: string,
  ...data: Data
): Promise<Res> => {
  const hub = await getSignalr()

  const { Success, Response, Status, Msg } = await hub.invoke(url, ...data)
  if (Status === 200 && Success) {
    return Response
  }

  throw new Error(Msg || '未知服务错误')
}
