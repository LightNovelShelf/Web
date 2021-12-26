export function changeThemeColor(isDark: boolean) {
  const metaThemeColor = document.querySelector('meta[name=theme-color]')
  metaThemeColor.setAttribute('content', isDark ? '#263238' : '#1976D2')
}
