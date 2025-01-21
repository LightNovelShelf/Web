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
