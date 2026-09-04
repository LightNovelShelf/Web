import { Dialog } from 'quasar'

export interface EditorHtmlIssues {
  inlineBreakParagraphs: number
  leadingFullWidthSpaceParagraphs: number
}

export function inspectEditorHtml(html: string): EditorHtmlIssues {
  const template = document.createElement('template')
  template.innerHTML = html

  let inlineBreakParagraphs = 0
  let leadingFullWidthSpaceParagraphs = 0

  template.content.querySelectorAll('p').forEach((paragraph) => {
    if (/^[\t\n\r ]*　/.test(paragraph.textContent ?? '')) {
      leadingFullWidthSpaceParagraphs++
    }

    if (!paragraph.querySelector('br')) return

    const withoutBreaks = paragraph.cloneNode(true) as HTMLParagraphElement
    withoutBreaks.querySelectorAll('br').forEach((br) => br.remove())
    const hasText = Boolean(withoutBreaks.textContent?.trim())
    const hasEmbeddedContent = Boolean(
      withoutBreaks.querySelector('img, picture, svg, video, audio, iframe, canvas, object, embed, hr, input, textarea, select, table'),
    )
    if (hasText || hasEmbeddedContent) inlineBreakParagraphs++
  })

  return { inlineBreakParagraphs, leadingFullWidthSpaceParagraphs }
}

function openConfirmation(options: Parameters<typeof Dialog.create>[0]) {
  return new Promise<boolean>((resolve) => {
    let confirmed = false
    Dialog.create(options)
      .onOk(() => {
        confirmed = true
      })
      .onDismiss(() => resolve(confirmed))
  })
}

export async function confirmEditorHtmlSave(html: string, confirmWhenClean = false) {
  const issues = inspectEditorHtml(html)
  const descriptions: string[] = []

  if (issues.inlineBreakParagraphs) {
    descriptions.push('段内使用 &lt;br&gt; 换行')
  }
  if (issues.leadingFullWidthSpaceParagraphs) {
    descriptions.push('段首使用全角空格')
  }

  if (!descriptions.length) {
    if (!confirmWhenClean) return true
    return openConfirmation({ title: '提示', message: '你确定要保存吗？', cancel: true })
  }

  return openConfirmation({
    title: '检测到不推荐的排版',
    message: `检测到${descriptions.join('、')}。这些写法可能导致正文缩进异常，建议先阅读<a href="/announcement/detail/7" target="_blank">编辑器相关公告</a>。是否仍要强制保存？`,
    html: true,
    persistent: true,
    ok: { label: '强制保存', color: 'negative', unelevated: true, noCaps: true },
    cancel: { label: '返回修改', color: 'grey-7', flat: true, noCaps: true },
  })
}
