import FingerprintJS from '@fingerprintjs/fingerprintjs'

export const visitorId = FingerprintJS.load()
  .then((fingerprint) => fingerprint.get())
  .then((result) => result.visitorId)
