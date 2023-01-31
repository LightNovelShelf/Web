/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

const { configure } = require('quasar/wrappers')
const { ProvidePlugin, DefinePlugin } = require('webpack')
const AutoImportPlugin = require('unplugin-auto-import/webpack')
const ComponentsPlugin = require('unplugin-vue-components/webpack')
const IconsPlugin = require('unplugin-icons/webpack')
const IconsResolver = require('unplugin-icons/resolver')
const { configEnv } = require('./config/env.js')

// 配置一次env并记录env对象
const env = configEnv()

/** DefinePlugin要求 */
function getEnvForDefinePlugin() {
  return Object.keys(process.env).reduce((obj, key) => {
    // 只导入VUE开头的系统变量，导入全部变量可能会有重名危险导致全局未定义变量逃过检查
    if (key.indexOf('VUE_') === 0) {
      obj[key] = JSON.stringify(process.env[key])
    }
    return obj
  }, {})
}

const __DEV__ = process.env.NODE_ENV === 'development'

module.exports = configure(function (ctx) {
  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: './src/**/*.{ts,tsx,js,jsx,vue}'
        }
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: ['app', 'quasar', 'v-viewer'],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font' // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
    build: {
      vueRouterMode: 'history', // available values: 'hash', 'history'

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      uglifyOptions: {
        compress: {
          /** 生产包移除console */
          drop_console: true
        }
      },

      analyze: !!process.env.ANALYZE && {
        analyzerMode: 'static',
        generateStatsFile: true
      },

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpack(chain) {
        chain.resolve.set('fallback', {
          assert: require.resolve('assert/'),
          util: require.resolve('util/'),
          process: require.resolve('process/browser')
        })
        chain.plugin('process').use(new ProvidePlugin({ process: 'process' }))
        chain.plugin('env').use(
          new DefinePlugin({
            ...getEnvForDefinePlugin(),
            __DEV__: JSON.stringify(__DEV__)
          })
        )

        // 添加 unplugin 相关插件
        chain.plugin('unplugin-auto-import').use(
          /** @link https://github.com/antfu/unplugin-auto-import/blob/main/src/types.ts#L74 */
          AutoImportPlugin({
            /** @url https://github.com/antfu/unplugin-auto-import/blob/main/src/presets/index.ts#L38 */
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'auto-imports.d.ts',
            eslintrc: {
              enabled: true,
              filepath: '.eslintrc-auto-import.json',
              globalsPropValue: 'readonly'
            }
          })
        )
        chain.plugin('unplugin-vue-components').use(
          ComponentsPlugin({
            // 禁止自动resolve本地的组件，避免cr时每读一个组件都要先翻dts查组件是哪里来的
            dirs: [],
            // resolvers: [],
            dts: 'components.d.ts',
            resolvers: [IconsResolver({})]
          })
        )
        chain.plugin('unplugin-icons').use(
          IconsPlugin({
            compiler: 'vue3',
            scale: 1
          })
        )
      },
      env: {
        ...env,
        __DEV__: process.env.NODE_ENV === 'development'
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http'
      },
      port: 8080,
      open: false // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
    framework: {
      config: {
        screen: {
          bodyClasses: true // <<< add this
        },
        loadingBar: {
          skipHijack: true
        }
      },

      // iconSet: 'material-icons', // Quasar icon set
      lang: 'zh-CN', // Quasar language pack

      // For special cases outside where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'LoadingBar', 'Dialog', 'AppFullscreen', 'AppVisibility', 'Meta']
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)

      chainWebpackWebserver(/* chain */) {
        /** */
      },

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        navigateFallback: 'index.html',
        skipWaiting: true, // 跳过等待
        clientsClaim: true, // 让sw立即接管网页,
        runtimeCaching: [
          {
            urlPattern: /.*\.(woff2|woff|ttf)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /.*\/icons\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      }, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      chainWebpackCustomSW(/* chain */) {
        /**  */
      },

      manifest: {
        name: '轻书架',
        short_name: '轻书架',
        description: '',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ] // 急需一个新Icon
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: '{{ name }}'
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackMain(/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackMain also available besides this chainWebpackMain
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload(/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackPreload also available besides this chainWebpackPreload
      }
    }
  }
})
