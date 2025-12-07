import { parallelLimiter } from './parallelLimiter'

async function sendRequest() {}
function maybeCallLater(cb: () => void) {
  cb()
}

async function normal() {
  const locker = parallelLimiter.acquire()
  try {
    await locker.ready

    sendRequest()
  } finally {
    locker.release()
  }
}

async function releaseBeforeReady() {
  const locker = parallelLimiter.acquire()

  // maybe some where else release it first
  locker.release()

  try {
    // the ready-promise will throw
    await locker.ready
  } catch (err) {
    console.log('expected error for early-release', err)
  }
}

async function doubleRelease() {
  const locker = parallelLimiter.acquire()

  // do not rely on 'this'
  maybeCallLater(locker.release)
  // release twice should be ok
  maybeCallLater(locker.release)
  // even third
  maybeCallLater(locker.release)
}
