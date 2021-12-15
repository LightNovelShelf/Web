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
    manifestOptions: {
      background_color: '#ffffff'
    },
    // TODO 后续换成InjectManifest
    workboxPluginMode: 'GenerateSW'
    // workboxOptions: {
    //   swSrc: 'src/service-worker.ts'
    // }
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
