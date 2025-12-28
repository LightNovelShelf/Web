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
  getUrl(): string
  getToken: () => Promise<string>
}
type CreateSignalrContext = {
  hub: HubConnection | null
}
type CreateSignalrActions = {}
type CreateSignalrReturn = [CreateSignalrContext, CreateSignalrActions]

function createSignalr(config: CreateSignalrConfig): CreateSignalrReturn {
  const context = { hub: null }

  const actions: CreateSignalrActions = {}

  // TODO: 再想想？这里用watch感觉有点怪…虽然用了各种特性看起来高深莫测一样
  // #region watch-url then re-create hub
  {
    const scope = effectScope(true)
    scope.run(() => {
      const createHubConfig = computed<CreateSignalrHubConfig>(() => {
        return {
          url: config.getUrl(),
          getToken: config.getToken,
        }
      })

      watch(
        [createHubConfig],
        ([config], _, onCleanup) => {
          const hub = createSignalrHub(config)
          context.hub = hub
          onCleanup(() => {
            hub.stop()
          })
        },
        { immediate: true },
      )
    })
  }
  // #endregion

  return [context, actions]
}

const signalr = createSignalr(
  // @ts-expect-error TODO:
  {},
)

export { signalr }
