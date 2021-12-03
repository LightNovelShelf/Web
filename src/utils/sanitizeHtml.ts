import DOMPurify from 'dompurify'

let sanitizer = null
if (window.Sanitizer) {
  sanitizer = new window.Sanitizer()
}

export default function sanitizerHtml(content: string, tag = 'div') {
  if (sanitizer) {
    return sanitizer.sanitizeFor('div', content).innerHTML
  } else {
    return DOMPurify.sanitize(content)
  }
}
