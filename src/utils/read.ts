import localforage from 'localforage'
import { debounce } from 'quasar'
function findElementNode(node: Node) {
  return node.nodeType === Node.ELEMENT_NODE ? node : findElementNode(node.parentNode)
}
function readXPath(element: Element) {
  /* eslint-disable */
  if (element.id !== '') {
    return '//*[@id="' + element.id + '"]'
  }
  if (element.tagName.toLowerCase() === 'body') {
    return '/html/' + element.tagName.toLowerCase()
  }
  let ix = 1,
    siblings = element.parentNode.childNodes

  for (let i = 0, l = siblings.length; i < l; i++) {
    let sibling = siblings[i]
    if (sibling === element) {
      return readXPath(element.parentNode as Element) + '/' + element.tagName.toLowerCase() + '[' + ix + ']'
    } else if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
      ix++
    }
  }
}

export async function loadHistory(uid: number, BookId: number) {
  let history = await localforage.getItem<{ [key: number]: { Id: number; xpath: string } }>(`ReadHistory_${uid}`)
  return history?.[BookId]
}

export async function saveHistory(
  uid: number,
  BookId: number,
  bookParam: {
    Id: number
    xpath: string
  }
) {
  let history = await localforage.getItem<{ [key: number]: { Id: number; xpath: string } }>(`ReadHistory_${uid}`)
  history = {
    ...history,
    [BookId]: bookParam
  }
  return await localforage.setItem(`ReadHistory_${uid}`, history).catch((err) => console.log(err))
}

export async function syncReading(
  dom: Element,
  uid: number,
  bookParam: {
    BookId: number
    Id: number
  },
  offset: number = 0
) {
  let visibleDom: HTMLElement[] = []
  let doSync = debounce(() => {
    let topTarget = visibleDom.reduce((res: { target: HTMLElement; rect: DOMRect }, target: HTMLElement) => {
      // target.style.background = null
      let rect = target.getBoundingClientRect()
      // 这里top>0 有疑问，是否要一个元素完全可见
      if (rect.top >= offset) {
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
      let xpath = readXPath(topTarget.target)
      saveHistory(uid, bookParam?.BookId, {
        Id: bookParam?.Id,
        xpath
      })
    }
  }, 300)
  let io = new IntersectionObserver((entities) => {
    entities.forEach((entity) => {
      if (entity.target instanceof HTMLElement) {
        let domTarget = entity.target as HTMLElement
        // domTarget.style.background = null
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
  let history = await loadHistory(uid, bookParam?.BookId)
  setTimeout(() => {
    if (`${history.Id}` === `${bookParam?.Id}` && history?.xpath) {
      try {
        let rst = document.evaluate(history?.xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
        let target = rst.iterateNext() as HTMLElement
        if (target) {
          // 手机兼容性问题
          // target.scrollIntoView()
          document.scrollingElement.scrollTop = target.getBoundingClientRect().top - offset
        }
      } catch (e) {
        console.log(e)
      }
    }
  }, 150)
  // 忘了这里为啥要清空一次，老版笨代码里面抄过来
  saveHistory(uid, bookParam?.BookId, {
    Id: bookParam?.Id,
    xpath: ''
  })
}
