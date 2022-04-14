import DOMPurify from 'dompurify'

let sanitizer: null | { sanitizeFor: (...args: unknown[]) => any } = null
if (window.Sanitizer) {
  sanitizer = new window.Sanitizer({ allowElements: ['svg'] })
}

export default function sanitizerHtml(content: string, tag = 'div') {
  if (sanitizer) {
    return sanitizer.sanitizeFor(tag, content).innerHTML
  } else {
    return DOMPurify.sanitize(content)
  }
}
