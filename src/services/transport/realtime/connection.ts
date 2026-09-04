import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { computed, readonly, shallowRef } from 'vue'

import { apiServer } from '@/services/apiServer'
import { getSessionToken } from '@/services/auth/session'

import { RealtimeRetryPolicy } from './retryPolicy'

import type { HubConnection } from '@microsoft/signalr'

const INITIAL_RECONNECT_DELAY_MS = 15_000
const subscriptions = new Map<string, Set<(response: unknown) => void>>()
const connectionState = shallowRef(HubConnectionState.Disconnected)

let connection = buildConnection()
let startRequest: Promise<HubConnection> | null = null
let initialReconnectTimer: number | undefined
let automaticReconnectWaiter:
  | {
      connection: HubConnection
      promise: Promise<HubConnection>
      resolve: (connection: HubConnection) => void
      reject: (reason: unknown) => void
    }
  | undefined
let restartChain: Promise<unknown> = Promise.resolve()

export const hubConnectionState = readonly(connectionState)
export const isRealtimeConnected = computed(() => connectionState.value === HubConnectionState.Connected)
export const realtimeConnectionStatus = computed<'online' | 'reconnecting' | 'offline'>(() => {
  if (connectionState.value === HubConnectionState.Connected) return 'online'
  if (
    connectionState.value === HubConnectionState.Connecting ||
    connectionState.value === HubConnectionState.Reconnecting
  ) {
    return 'reconnecting'
  }
  return 'offline'
})

function syncConnectionState(target: HubConnection): void {
  if (target === connection) connectionState.value = target.state
}

function resolveAutomaticReconnect(target: HubConnection): void {
  if (automaticReconnectWaiter?.connection !== target) return
  automaticReconnectWaiter.resolve(target)
  automaticReconnectWaiter = undefined
}

function rejectAutomaticReconnect(target: HubConnection, reason: unknown): void {
  if (automaticReconnectWaiter?.connection !== target) return
  automaticReconnectWaiter.reject(reason)
  automaticReconnectWaiter = undefined
}

function scheduleInitialReconnect(target: HubConnection): void {
  if (target !== connection || initialReconnectTimer !== undefined) return
  initialReconnectTimer = setTimeout(() => {
    initialReconnectTimer = undefined
    void ensureRealtimeConnection().catch(() => undefined)
  }, INITIAL_RECONNECT_DELAY_MS)
}

function buildConnection(): HubConnection {
  const target = new HubConnectionBuilder()
    .withUrl(`${apiServer.value}/hub/api`, {
      accessTokenFactory: async () => (await getSessionToken()) ?? '',
    })
    .withAutomaticReconnect(new RealtimeRetryPolicy())
    .withHubProtocol(new MessagePackHubProtocol())
    .configureLogging(import.meta.env.QUASAR_APP_URL ? LogLevel.Information : LogLevel.Critical)
    .build()

  target.onreconnecting(() => syncConnectionState(target))
  target.onreconnected(() => {
    syncConnectionState(target)
    resolveAutomaticReconnect(target)
  })
  target.onclose((error) => {
    if (target !== connection) return
    startRequest = null
    syncConnectionState(target)
    rejectAutomaticReconnect(target, error ?? new Error('实时连接已关闭'))
    scheduleInitialReconnect(target)
  })

  for (const [methodName, callbacks] of subscriptions) {
    for (const callback of callbacks) target.on(methodName, callback)
  }
  return target
}

function waitForAutomaticReconnect(target: HubConnection): Promise<HubConnection> {
  if (automaticReconnectWaiter?.connection === target) return automaticReconnectWaiter.promise

  let resolve!: (connection: HubConnection) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<HubConnection>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  automaticReconnectWaiter = { connection: target, promise, resolve, reject }
  return promise
}

export function ensureRealtimeConnection(): Promise<HubConnection> {
  const target = connection
  if (target.state === HubConnectionState.Connected) return Promise.resolve(target)
  if (target.state === HubConnectionState.Reconnecting) return waitForAutomaticReconnect(target)
  if (startRequest) return startRequest

  connectionState.value = HubConnectionState.Connecting
  const pending = target
    .start()
    .then(() => {
      syncConnectionState(target)
      return target
    })
    .catch((error: unknown) => {
      syncConnectionState(target)
      scheduleInitialReconnect(target)
      throw error
    })
    .finally(() => {
      if (startRequest === pending) startRequest = null
    })
  startRequest = pending
  return pending
}

async function replaceConnection(): Promise<void> {
  if (initialReconnectTimer !== undefined) {
    clearTimeout(initialReconnectTimer)
    initialReconnectTimer = undefined
  }

  const previous = connection
  rejectAutomaticReconnect(previous, new Error('实时连接正在重启'))
  connection = buildConnection()
  startRequest = null
  connectionState.value = HubConnectionState.Disconnected

  await previous.stop()
  await ensureRealtimeConnection()
}

export function restartRealtimeConnection(): Promise<void> {
  const operation = restartChain.then(replaceConnection, replaceConnection)
  restartChain = operation.catch(() => undefined)
  return operation
}

export function subscribeRealtime<Response = unknown>(
  methodName: string,
  callback: (response: Response) => void,
): () => void {
  const callbacks = subscriptions.get(methodName) ?? new Set<(response: unknown) => void>()
  callbacks.add(callback as (response: unknown) => void)
  subscriptions.set(methodName, callbacks)
  connection.on(methodName, callback)

  return () => {
    const currentCallbacks = subscriptions.get(methodName)
    currentCallbacks?.delete(callback as (response: unknown) => void)
    if (currentCallbacks?.size === 0) subscriptions.delete(methodName)
    connection.off(methodName, callback)
  }
}
