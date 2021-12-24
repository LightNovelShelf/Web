import { debounce } from 'quasar'
import { saveReadPosition } from '@/services/book'
import { Ref } from 'vue'
import { userReadPositionDB } from '@/utils/storage/db'

function findElementNode(node: Node): Element {
  // @ts-ignore
  return node.nodeType === Node.ELEMENT_NODE ? node : findElementNode(node.parentNode)
}

function readXPath(element: Element, context: Element = document.body) {
  if (context === document.body) {
    /* eslint-disable */
    if (element.id !== '') {
      return '//*[@id="' + element.id + '"]'
    }
  }
  if (context && element === context) {
    return '//*'
  }

  let ix = 1,
    siblings = element.parentNode.childNodes

  for (let i = 0, l = siblings.length; i < l; i++) {
    let sibling = siblings[i]
    if (sibling === element) {
      return readXPath(element.parentNode as Element, context) + '/' + element.tagName.toLowerCase() + '[' + ix + ']'
    } else if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
      ix++
    }
  }
}

export async function loadHistory(uid: number, BookId: number) {
  return await userReadPositionDB.get<{ cid: number; xPath: string }>(`${uid}_${BookId}`)
}

export async function saveHistory(
  uid: number,
  BookId: number,
  bookParam: {
    Id: number
    xpath: string
  }
) {
  await userReadPositionDB.set(`${uid}_${BookId}`, {
    cid: bookParam.Id,
    xPath: bookParam.xpath
  })
  await saveReadPosition({ Bid: BookId, Cid: bookParam.Id, XPath: bookParam.xpath })
}

export function scrollToHistory(dom: Element, xPath: string, offset: Ref<number>) {
  try {
    let rst = document.evaluate(xPath, dom, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
    let target = rst.iterateNext() as HTMLElement
    if (target) {
      document.scrollingElement.scrollTop = target.getBoundingClientRect().top - offset.value
    }
  } catch (e) {
    console.log(e)
  }
}

export async function syncReading(
  dom: Element,
  uid: Ref<number>,
  bookParam: {
    BookId: Ref<number>
    CId: Ref<number>
  },
  offset: Ref<number>
) {
  let visibleDom: HTMLElement[] = []
  let doSync = debounce(async () => {
    let topTarget = visibleDom.reduce((res: { target: HTMLElement; rect: DOMRect }, target: HTMLElement) => {
      // target.style.background = null
      let rect = target.getBoundingClientRect()
      if (rect.top >= offset.value) {
        if (res) {
          if (rect.top < res.rect.top) {
            res = {
              target,
              rect
            }
          }
        } else {
          res = {
            target,
            rect
          }
        }
      }
      return res
    }, null)
    if (topTarget) {
      // topTarget.target.style.background = 'red'
      // console.log(topTarget.target, readXPath(topTarget.target))
      let xpath = readXPath(topTarget.target, dom)
      await saveHistory(uid.value, bookParam?.BookId.value, {
        Id: bookParam?.CId.value,
        xpath
      })
    }
  }, 300)
  let io = new IntersectionObserver((entities) => {
    entities.forEach((entity) => {
      if (entity.target instanceof HTMLElement) {
        let domTarget = entity.target as HTMLElement
        domTarget.style.background = null
        if (entity.isIntersecting) {
          visibleDom.push(domTarget)
        } else {
          visibleDom = visibleDom.filter((target) => target !== domTarget)
        }
      }
      doSync()
    })
  })

  let walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT, (node) => {
    return node.nodeValue.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  })
  while (walker.nextNode()) {
    try {
      let dom = findElementNode(walker.currentNode)
      io.observe(dom)
    } catch (e) {
      console.log(e)
    }
  }
}
