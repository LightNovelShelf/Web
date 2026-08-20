export function getPlaceholder(url: string): string | null {
  if (!url) return null
  try {
    return new URL(url).searchParams.get('placeholder') || null
  } catch {
    return null
  }
}
export function getImageSize(url: string): [width: number, height: number] | null {
  if (!url) return null
  try {
    const size = new URL(url).searchParams.get('size')
    const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(size ?? '')
    return match ? [Number(match[1]), Number(match[2])] : null
  } catch {
    return null
  }
}

export function withImageHeight(url: string, height: number): string {
  if (!url) return url
  const uri = new URL(url)
  uri.searchParams.set('height', String(height))
  return uri.toString()
}

// 漫画阅读器按图片朝向请求缩放高度：横图（宽>高）1024，其余 2048。
export function withReaderHeight(url: string, width: number, height: number): string {
  return withImageHeight(url, width > height ? 1024 : 2048)
}
