import { defineBoot } from '#q-app/wrappers'
import Cropper from 'cropperjs'
import { config } from 'md-editor-v3'
import * as prettier from 'prettier'
import parserMarkdown from 'prettier/plugins/markdown'
import screenfull from 'screenfull'

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
    markdownItPlugins(plugins) {
      return plugins.map((p) => {
        if (p.type === 'image') {
          return {
            ...p,
            plugin: (md, pluginOptions) => {
              md.renderer.rules.image = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                const src = token.attrs[token.attrIndex('src')][1]
                return `<div class="${pluginOptions.classes}"><img src="${src}"></div>`
              }

              // 判断图片是否在段落中，如果是则不生成 p 标签

              md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
                const nextToken = tokens[idx + 1]
                if (nextToken && nextToken.children?.find((t) => t.type === 'image')) {
                  return ''
                }
                return '<p>'
              }

              md.renderer.rules.paragraph_close = function (tokens, idx, options, env, self) {
                const prevToken = tokens[idx - 1]
                if (prevToken && prevToken.children?.find((t) => t.type === 'image')) {
                  return ''
                }
                return '</p>'
              }
            },
            options: {
              classes: 'illus',
            },
          }
        }

        return p
      })
    },
  })
})
