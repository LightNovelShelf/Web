import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { ungzip } from 'pako'

import type { HubConnection, HubConnectionState } from '@microsoft/signalr'

type CreateSignalrHubConfig = {
  url: string
  getToken: () => Promise<string>
}

function createSignalrHub(config: CreateSignalrHubConfig) {
  let builder = new HubConnectionBuilder()

  builder = builder
    .withUrl(config.url, {
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: config.getToken,
    })
    .withAutomaticReconnect()
    .withHubProtocol(new MessagePackHubProtocol())
    .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Critical)

  return builder.build()
}

type CreateSignalrConfig = {
  url: string
  getToken: () => Promise<string>
}
type CreateSignalrContext = {
  hub: HubConnection | null

  config: CreateSignalrConfig

  init(config: Partial<CreateSignalrConfig>): void

  start(): Promise<void>
  _startPromise?: Promise<void>

  stop(): Promise<void>
  _stopPromise?: Promise<void>

  invoke<R, P extends any[]>(url: string, ...p: P): Promise<R>

  subscribe<R>(event: string, cb: (data: R) => void): void
  unSubscribe(event: string, cb?: (...p: any[]) => void): void
}
type CreateSignalrReturn = CreateSignalrContext

function createSignalrService(config: CreateSignalrConfig): CreateSignalrReturn {
  const context: CreateSignalrContext = {
    hub: null,

    config,

    async init(config: Partial<CreateSignalrConfig>) {
      const nextConfig = { ...context.config, ...config }
      context.config = nextConfig

      const hub = context.hub
      if (hub) {
        context.hub = null
        // 好像我也没必要一定要等它确实stop之后才能重连；反正我都有新的inst了
        // await hub.stop()
        hub.stop()

        context._startPromise = null
      }
      context.hub = createSignalrHub(nextConfig)
    },

    async start() {
      if (!context.hub) return Promise.reject(new Error('Hub is not initialized'))
      if (!context._startPromise) {
        context._startPromise = context.hub.start()
      }

      return context._startPromise
    },

    async stop() {
      if (!context.hub) return Promise.reject(new Error('Hub is not initialized'))
      if (!context._stopPromise) {
        context._stopPromise = context.hub.stop()
      }
      return context._stopPromise
    },

    async invoke(url, ...p) {
      if (!context.hub) return Promise.reject(new Error('Hub is not initialized'))
      await context.start()
      return context.hub.invoke(url, ...p)
    },

    async subscribe(event, cb) {
      if (!context.hub) return Promise.reject(new Error('Hub is not initialized'))
      // TODO: on 可能不需要等start？
      await context.start()
      return context.hub.on(event, cb)
    },

    async unSubscribe(event, cb) {
      if (!context.hub) return Promise.reject(new Error('Hub is not initialized'))

      if (cb) context.hub.off(event, cb)
      return context.hub.off(event)
    },
  }

  return context
}

const signalr = createSignalrService({ url: import.meta.env.VITE_SIGNALR_URL, getToken: async () => '' })

export { signalr }
