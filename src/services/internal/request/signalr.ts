import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'

/** signalr接入点 */
const HOST = `${process.env.VUE_APP_API_SERVER}/hub/api`

/** 缓存 HubConnection，当初始化或者链接失效时置为null */
let connection: null | HubConnection = null
/** 记录Promie避免多次发起链接 */
let connectPromise: null | Promise<HubConnection> = null

/** 返回一个可用的 signalr 实例 */
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
      })
      // catch分支不处理，一次失败后就等下个请求再继续重连，不再这里做循环重连，维护不慎容易爆炸
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
