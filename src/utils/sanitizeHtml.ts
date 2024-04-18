import DOMPurify from 'dompurify'

let sanitizer: null | { sanitizeFor: (...args: unknown[]) => any } = null

try {
  if (window.Sanitizer) {
    const defaultConfig = new window.Sanitizer().getConfiguration()
    defaultConfig.allowElements.push('svg')
    sanitizer = new window.Sanitizer(defaultConfig)
  }
} catch (e) {
  // ignore
}

export default function sanitizerHtml(content: string, tag = 'div') {
  if (sanitizer) {
    if (sanitizer.sanitizeFor) {
      return sanitizer.sanitizeFor(tag, content).innerHTML
    } else {
      const element = document.createElement(tag)
      element.setHTML(content, { sanitizer: sanitizer })
      return element.innerHTML
    }
  } else {
    return DOMPurify.sanitize(content)
  }
}
