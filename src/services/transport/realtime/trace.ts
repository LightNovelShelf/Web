/* eslint-disable no-console */
const traceEnabled = import.meta.env.QUASAR_DEV && import.meta.env.VUE_TRACE_SERVER

type TraceState = {
  lastTimestamp: number
  records: Array<{ event: string; elapsed: number; data?: unknown }>
}

export function createRealtimeTrace(methodName: string, params: unknown[]): TraceState | null {
  if (!traceEnabled) return null

  const now = performance.now()
  return {
    lastTimestamp: now,
    records: [{ event: `INIT ${methodName}`, elapsed: 0, data: params }],
  }
}

export function recordRealtimeTrace(trace: TraceState | null, event: string, data?: unknown): void {
  if (!trace) return

  const now = performance.now()
  trace.records.push({ event, elapsed: now - trace.lastTimestamp, data })
  trace.lastTimestamp = now
}

export function flushRealtimeTrace(trace: TraceState | null): void {
  if (!trace) return

  console.groupCollapsed('realtime request trace')
  for (const record of trace.records) {
    console.log(`${record.event} +${record.elapsed.toFixed(2)}ms`, record.data)
  }
  console.groupEnd()
}
