// Configuration for your app
// https://quasar.dev/quasar-cli-vite/quasar-config-file

import AutoImport from 'unplugin-auto-import/vite'

import { defineConfig } from '#q-app'

let sha = import.meta.env.CF_PAGES_COMMIT_SHA || import.meta.env.GITHUB_SHA || 'dev'
if (sha.length > 7) sha = sha.substring(0, 7)

const autoImportPlugin = AutoImport({
  imports: ['vue', 'vue-router', 'pinia'],
})
const vitePlugins = Array.isArray(autoImportPlugin) ? autoImportPlugin : [autoImportPlugin]

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['app', 'quasar', 'v-viewer', 'dayjs', 'md-editor'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      // 'material-icons', // 项目使用 mdi-js
    ],

    // Full list of options: https://quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node22',
      },

      typescript: {
        strict: false,
        vueShim: true,
        // extendTsConfig(tsConfig) {},
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,

      // v-viewer / vuedraggable / md-editor-v3 ship Options API components
      vueOptionsAPI: true,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',

      // https://quasar.dev/quasar-cli-vite/handling-import-meta-env
      env: {
        // 只有 VUE_ 开头的 dotenv 变量会被暴露给客户端代码
        clientPrefix: 'VUE_',
        file: ctx.dev ? ['.env.dev'] : ['.env.prod'],
        // 仅 CI 提供，quasar.config 自己使用；类型见 /env.d.ts
        ignoreType: ['import.meta.env.CF_PAGES_COMMIT_SHA', 'import.meta.env.GITHUB_SHA'],
      },

      defineEnv: {
        VUE_COMMIT_SHA: sha,
      },

      // ignorePublicFolder: true,
      // minify: false,
      // distDir
      // alias: {},

      extendViteConf(viteConf) {
        viteConf.build = {
          ...viteConf.build,
          rollupOptions: {
            output: {
              assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
              manualChunks: (id) => {
                if (id.includes('node_modules')) {
                  if (id.includes('md-editor-v3') || id.includes('codemirror')) return 'vendor-editor'
                  return 'vendor'
                }

                if (id.includes('/src/')) {
                  return 'chunk'
                }
              },
            },
          },
        }
      },
      // viteVuePluginOptions: {},

      vitePlugins,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true,
      open: false, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        screen: {
          bodyClasses: true,
        },
        loadingBar: {
          skipHijack: true,
        },
      },

      // iconSet: 'material-icons', // Quasar icon set
      lang: 'zh-CN', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'LoadingBar', 'Dialog', 'AppFullscreen', 'AppVisibility', 'Meta'],
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-sw',
    //   pwaServiceWorker: 'src-pwa/sw/custom-sw',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    // },

    // https://quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      swFilename: 'service-worker.js',
      // manifestFilename: 'manifest.json'
      // extendPWAManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPWAMetaTags: false,
      // extendPWACustomSWConf (rolldownConf) {},
      extendPWAGenerateSWOptions(cfg) {
        cfg.maximumFileSizeToCacheInBytes = 3 * 1024 * 1024
      },
      // extendPWAInjectManifestOptions (cfg) {}
    },
  }
})
