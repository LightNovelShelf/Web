import type { IRetryPolicy, RetryContext } from '@microsoft/signalr'

const RETRY_DELAYS_MS = [0, 5_000, 10_000, 20_000] as const
const MAX_RETRY_DELAY_MS = 30_000

export class RealtimeRetryPolicy implements IRetryPolicy {
  nextRetryDelayInMilliseconds(context: RetryContext): number {
    return RETRY_DELAYS_MS[context.previousRetryCount] ?? MAX_RETRY_DELAY_MS
  }
}
