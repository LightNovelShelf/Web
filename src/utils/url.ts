function getPlaceholder(url: string): string | null {
  if (!url) return null
  try {
    return new URL(url).searchParams.get('placeholder') || null
  } catch {
    return null
  }
}
function getImageSize(url: string): [width: number, height: number] | null {
  if (!url) return null
  try {
    const size = new URL(url).searchParams.get('size')
    const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(size ?? '')
    return match ? [Number(match[1]), Number(match[2])] : null
  } catch {
    return null
  }
}
export function getSystemImageMetadata(url: string): { placeholder: string; width: number; height: number } | null {
  const placeholder = getPlaceholder(url)
  const size = getImageSize(url)
  return placeholder && size ? { placeholder, width: size[0], height: size[1] } : null
}

export function withImageHeight(url: string, height: number): string {
  if (!url) return url
  const uri = new URL(url)
  uri.searchParams.set('height', String(height))
  return uri.toString()
}

// 只有完整系统图床元数据才添加缩放参数；横图 1024，其余 2048。
export function withReaderHeight(url: string): string {
  const metadata = getSystemImageMetadata(url)
  if (!metadata) return url
  return withImageHeight(url, metadata.width > metadata.height ? 1024 : 2048)
}
