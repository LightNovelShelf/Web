export function midPic(url: string): string {
  if (!url) {
    return ''
  }
  const domain = url.split('/')[2]
  if (['img.acgdmzy.com:45112', 'img.lightnovel.app:45220', 'imgfrp.lightnovel.app'].includes(domain)) {
    const t = url.split('.')
    t[t.length - 1] = 'md.' + t[t.length - 1]
    return t.join('.')
  } else {
    return url
  }
}
