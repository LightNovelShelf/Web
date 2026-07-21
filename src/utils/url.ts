export function getPlaceholder(url: string): string | null {
  if (url) {
    const uri = new URL(url)
    return uri.searchParams.get('placeholder') || null
  }

  return url
}

// 漫画阅读器按图片朝向请求缩放高度：横图（宽>高）1024，其余 2048。
export function withReaderHeight(url: string, width: number, height: number): string {
  if (!url) return url
  const uri = new URL(url)
  uri.searchParams.set('height', String(width > height ? 1024 : 2048))
  return uri.toString()
}
