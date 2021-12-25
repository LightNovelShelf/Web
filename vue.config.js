const path = require('path')
const { ProvidePlugin, DefinePlugin } = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

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
    // appleMobileWebAppStatusBarStyle: 'black', // 苹果移动网络应用状态栏样式
    manifestOptions: {
      background_color: '#ffffff'
    },
    // TODO 后续可能换成InjectManifest
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // swSrc: 'src/service-worker.ts',
      navigateFallback: 'index.html',
      skipWaiting: true, // 跳过等待
      clientsClaim: true, // 让sw立即接管网页,
      runtimeCaching: [
        {
          urlPattern: /.*\.(woff2|woff|ttf)/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'font-cache',
            cacheableResponse: {
              statuses: [200]
            }
          }
        }
      ]
    }
  },
  /** @param { import('webpack-chain') } config */
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = '轻书架'
      return args
    })

    /** https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript */
    config.when(__DEV__, (config) => {
      // 启用了严格模式的情况下移除ts-checker, 靠编辑器报错就够了；不然其它文件的报错也会跑出来
      const { readFileSync } = require('fs')
      const { parse } = require('json5')
      config.when(parse(readFileSync('./tsconfig.json')).compilerOptions.strict, (config) => {
        config.plugins.delete('fork-ts-checker')
      })
    })

    // 加入打包分析
    const ANALYZE = !!process.env.ANALYZE
    config.when(ANALYZE, (config) => {
      config.plugin('ANALYZE').use(BundleAnalyzerPlugin, [{ analyzerMode: 'static' }])
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
