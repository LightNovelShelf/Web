export function getPlaceholder(url: string): string | null {
  const uri = new URL(url)
  return uri.searchParams.get('placeholder') || null
}
