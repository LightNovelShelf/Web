const path = require('path')
const { ProvidePlugin, DefinePlugin } = require('webpack')

function resolve(dir) {
  return path.join(__dirname, dir)
}

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

module.exports = {
  productionSourceMap: false,
  pwa: {
    name: '轻书架',
    themeColor: '#1976d2',
    msTileColor: '#1976d2',
    appleMobileWebAppCapable: 'yes', // 是否开启apple的pwa
    appleMobileWebAppStatusBarStyle: 'black', // 苹果移动网络应用状态栏样式
    manifestOptions: {
      background_color: '#ffffff'
    },
    // TODO 后续可能换成InjectManifest
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // swSrc: 'src/service-worker.ts'
      skipWaiting: true, // 跳过等待
      clientsClaim: true, // 让sw立即接管网页,
      runtimeCaching: [
        {
          urlPattern: /((home)|(login)|(test)|(announcement)|(book)|(read)|(collaborator)|(setting))/,
          handler: 'StaleWhileRevalidate',
          options: {
            // Use a custom cache name for this route.
            cacheName: 'html-cache',
            plugins: [
              {
                // 缓存即将更新
                cacheWillUpdate: () => {
                  console.log('%c js cacheWillUpdate', 'color:#006DCB;')
                },
                // 缓存更新
                cacheDidUpdate: () => {
                  console.log('%c js cache update', 'color:#006DCB;')
                },
                // 将使用缓存的响应
                cachedResponseWillBeUsed: () => {
                  console.log('%c js cachedResponseWillBeUsed', 'color:#006DCB;')
                },
                // 请求正在获取。。。
                requestWillFetch: () => {
                  console.log('%c js cache requestWillFetch', 'color:#006DCB;')
                },
                // 请求获取失败
                fetchDidFail: () => {
                  console.log('%c js cache fetchDidFail', 'color:red;')
                }
              }
            ],
            matchOptions: {
              ignoreSearch: true
            },
            cacheableResponse: {
              statuses: [200]
            }
          }
        }
      ]
    }
  },
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = '轻书架'
      return args
    })
  },
  configureWebpack: {
    plugins: [
      new ProvidePlugin({ process: 'process' }),
      new DefinePlugin({
        ...getEnvForDefinePlugin(),
        __DEV__: JSON.stringify(__DEV__)
      })
    ],
    resolve: {
      alias: {
        '@': resolve('src')
      },
      fallback: {
        assert: require.resolve('assert/'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser')
      }
    }
  },
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  transpileDependencies: ['quasar']
}
