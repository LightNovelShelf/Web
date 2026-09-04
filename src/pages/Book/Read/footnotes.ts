export interface ReaderFootnoteOptions {
  mobile: boolean
  show: (event: MouseEvent, html: string, markerId: string) => void
  hide: () => void
}

export function prepareReaderFootnotes(root: HTMLElement, options: ReaderFootnoteOptions): () => void {
  const cleanup: Array<() => void> = []

  root.querySelectorAll<HTMLElement>('.duokan-footnote').forEach((marker, index) => {
    const href = marker.getAttribute('href')
    if (!href?.startsWith('#') || href.length === 1) return

    const note = root.querySelector<HTMLElement>(`#${CSS.escape(decodeFragment(href.slice(1)))}`)
    if (!note) return

    const markerId = `v-footnote-${index}`
    const show = (event: MouseEvent) => options.show(event, note.innerHTML, markerId)
    note.style.display = 'none'
    marker.removeAttribute('href')
    marker.setAttribute('global-cancel', 'true')
    marker.id = markerId

    if (options.mobile) {
      marker.addEventListener('click', show)
      cleanup.push(() => marker.removeEventListener('click', show))
    } else {
      marker.addEventListener('mouseenter', show)
      marker.addEventListener('mouseleave', options.hide)
      cleanup.push(() => {
        marker.removeEventListener('mouseenter', show)
        marker.removeEventListener('mouseleave', options.hide)
      })
    }
  })

  root.querySelectorAll<HTMLElement>('.footnotes').forEach((notes) => {
    notes.style.display = 'none'
  })

  return () => cleanup.forEach((dispose) => dispose())
}

function decodeFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}
