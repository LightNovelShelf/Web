export function getPlaceholder(url: string): string | null {
  if (url) {
    const uri = new URL(url)
    return uri.searchParams.get('placeholder') || null
  }

  return url
}
