import { userReadPositionDB } from '@/utils/storage/db'

import { saveReadPosition } from '@/services/book'

export interface ReadingHistory {
  cid: number
  xPath: string
  top: number
}

interface ReadingProgressOptions {
  root: HTMLElement
  userId: number
  bookId: number
  chapterId: number
  getHeaderOffset: () => number
}

function historyKey(userId: number, bookId: number): string {
  return `${userId}_${bookId}`
}

function findElementNode(node: Node): Element | null {
  if (node.nodeType === Node.ELEMENT_NODE) return node as Element
  return node.parentElement
}

function readXPath(element: Element, context: Element): string {
  if (element.id) return `//*[@id="${element.id}"]`
  if (element === context) return '.'

  const parent = element.parentElement
  if (!parent) return ''

  let index = 1
  for (const sibling of parent.children) {
    if (sibling === element) break
    if (sibling.tagName === element.tagName) index += 1
  }
  return `${readXPath(parent, context)}/${element.tagName.toLowerCase()}[${index}]`
}

export function loadHistory(userId: number, bookId: number): ReadingHistory | undefined {
  return userReadPositionDB.get<ReadingHistory>(historyKey(userId, bookId))
}

export async function saveHistory(
  userId: number,
  bookId: number,
  position: { chapterId: number; xPath: string },
): Promise<void> {
  userReadPositionDB.set<ReadingHistory>(historyKey(userId, bookId), {
    cid: position.chapterId,
    xPath: position.xPath,
    top: document.scrollingElement?.scrollTop ?? 0,
  })
  await saveReadPosition({ Bid: bookId, Cid: position.chapterId, XPath: position.xPath })
}

export function findElementByXPath(root: Element, xPath: string): Element | null {
  try {
    const result = document.evaluate(xPath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    return result.singleNodeValue instanceof Element ? result.singleNodeValue : null
  } catch {
    return null
  }
}

export function scrollToHistory(root: Element, xPath: string, offset: number): void {
  const target = findElementByXPath(root, xPath)
  if (!target || !document.scrollingElement) return
  document.scrollingElement.scrollTop =
    target.getBoundingClientRect().top + document.scrollingElement.scrollTop - offset
}

export function observeReadingProgress(options: ReadingProgressOptions): () => void {
  const visibleElements = new Set<Element>()
  let saveTimer: number | undefined

  const saveVisiblePosition = () => {
    const offset = options.getHeaderOffset()
    let closest: { element: Element; top: number } | undefined
    for (const element of visibleElements) {
      const top = element.getBoundingClientRect().top
      if (top < offset || (closest && top >= closest.top)) continue
      closest = { element, top }
    }
    if (!closest) return

    const xPath = readXPath(closest.element, options.root)
    if (!xPath) return
    void saveHistory(options.userId, options.bookId, { chapterId: options.chapterId, xPath }).catch(() => undefined)
  }

  const scheduleSave = () => {
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(saveVisiblePosition, 300)
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleElements.add(entry.target)
      else visibleElements.delete(entry.target)
    }
    scheduleSave()
  })

  const walker = document.createTreeWalker(options.root, NodeFilter.SHOW_TEXT, (node) =>
    node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  )
  while (walker.nextNode()) {
    const element = findElementNode(walker.currentNode)
    if (element) observer.observe(element)
  }

  return () => {
    observer.disconnect()
    visibleElements.clear()
    window.clearTimeout(saveTimer)
  }
}
