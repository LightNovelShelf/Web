import DOMPurify from 'dompurify'

// target 不在 DOMPurify 的默认白名单里，需要显式放行
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof HTMLAnchorElement && node.target === '_blank') {
    // 防反向 tabnabbing
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export default function sanitizerHtml(content: string) {
  return DOMPurify.sanitize(content, { ADD_ATTR: ['target'] })
}
