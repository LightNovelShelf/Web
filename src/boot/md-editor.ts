import Cropper from 'cropperjs'
import footnote from 'markdown-it-footnote'
import { config } from 'md-editor-v3'
import * as prettier from 'prettier'
import parserMarkdown from 'prettier/plugins/markdown'
import screenfull from 'screenfull'

import { defineBoot } from '#q-app'

export default defineBoot(() => {
  config({
    editorExtensions: {
      prettier: {
        prettierInstance: prettier,
        parserMarkdownInstance: parserMarkdown,
      },
      screenfull: {
        instance: screenfull,
      },
      cropper: {
        instance: Cropper,
      },
    },
    markdownItConfig(md) {
      md.set({ breaks: false })
    },
    markdownItPlugins(plugins) {
      const configured = plugins
        .filter((p) => p.type !== 'admonition')
        .map((p) => {
          if (p.type === 'image') {
            return {
              ...p,
              plugin: (md, pluginOptions) => {
                md.renderer.rules.image = function (tokens, idx, options, env, self) {
                  const token = tokens[idx]
                  const src = token.attrs[token.attrIndex('src')][1]
                  // 将src后的hash作为图片样式
                  const hash = src.split('#')[1] || ''
                  return `<img src="${src}" class="${hash}">`
                }

                // 判断段落中是否只有图片，如果是则返回 div.illus，否则返回 p
                md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
                  const nextToken = tokens[idx + 1]
                  if (nextToken && nextToken.children?.every((t) => t.type === 'image')) {
                    return '<div class="illus">'
                  }
                  return '<p>'
                }

                md.renderer.rules.paragraph_close = function (tokens, idx, options, env, self) {
                  const prevToken = tokens[idx - 1]
                  if (prevToken && prevToken.children?.every((t) => t.type === 'image')) {
                    return '</div>'
                  }
                  return '</p>'
                }
              },
              options: {},
            }
          }

          if (p.type === 'code') {
            return {
              ...p,
              plugin: (md) => {
                md.renderer.rules.fence = (tokens, idx) => {
                  const token = tokens[idx]
                  const language = token.info.trim().split(/\s+/, 1)[0]
                  const className = language ? ` class="language-${md.utils.escapeHtml(language)}"` : ''
                  return `<pre><code${className}>${md.utils.escapeHtml(token.content)}</code></pre>\n`
                }
                md.renderer.rules.code_block = md.renderer.rules.fence
              },
              options: {},
            }
          }

          return p
        })

      configured.push({
        type: 'footnote',
        plugin: (md) => {
          footnote(md)

          md.renderer.rules.footnote_caption = (tokens, idx) => `[${Number(tokens[idx].meta.id) + 1}]`
          md.renderer.rules.footnote_ref = (tokens, idx, options, env, self) => {
            const token = tokens[idx]
            const number = Number(token.meta.id) + 1
            const id = `ln-fn-${number}`
            const caption = self.rules.footnote_caption(tokens, idx, options, env, self)
            return `<a class="duokan-footnote" data-footnote-id="${id}" href="#${id}" role="doc-noteref"><sup>${caption}</sup></a>`
          }
          md.renderer.rules.footnote_block_open = () => '<section class="footnotes">\n'
          md.renderer.rules.footnote_block_close = () => '</section>\n'
          md.renderer.rules.footnote_open = (tokens, idx) => {
            const token = tokens[idx]
            const number = Number(token.meta.id) + 1
            const id = `ln-fn-${number}`
            const label = md.utils.escapeHtml(String(token.meta.label ?? `note-${number}`))
            return `<aside id="${id}" data-footnote-label="${label}">`
          }
          md.renderer.rules.footnote_close = () => '</aside>\n'
          md.renderer.rules.footnote_anchor = () => ''
        },
        options: {},
      })
      return configured
    },
  })
})
