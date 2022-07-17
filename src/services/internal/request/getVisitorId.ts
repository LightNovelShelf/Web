import FingerprintJS from '@fingerprintjs/fingerprintjs'

export const getVisitorId = new Promise<string>((resolve, reject) => {
  FingerprintJS.load().then((fp) => fp.get().then((result) => resolve(result.visitorId)))
})
