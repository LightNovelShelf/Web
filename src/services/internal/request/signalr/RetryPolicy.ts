import { IRetryPolicy, RetryContext } from '@microsoft/signalr/src/IRetryPolicy'

export class RetryPolicy implements IRetryPolicy {
  nextRetryDelayInMilliseconds(retryContext: RetryContext) {
    switch (retryContext.previousRetryCount) {
      case 0:
        return 0
      case 1:
        return 5000
      case 2:
        return 10000
      case 3:
        return 20000
      default:
        return 30000
    }
  }
}
