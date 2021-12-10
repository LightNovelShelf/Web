const textEncoder = new TextEncoder()

export enum HashMethod {
  SHA1 = 'SHA1',
  SHA256 = 'SHA-256',
  SHA384 = 'SHA-384',
  SHA512 = 'SHA-512'
}

/**
 * hash
 *
 * @url https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 */
async function hash(message: string, method: HashMethod = HashMethod.SHA256) {
  const msgUint8 = textEncoder.encode(message)
  const hashBuffer = await crypto.subtle.digest(method, msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export function sha256(message: string): Promise<string> {
  return hash(message, HashMethod.SHA256)
}
