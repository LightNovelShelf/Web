const path = require('path')
const ProvidePlugin = require('webpack').ProvidePlugin

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  productionSourceMap: false,

  configureWebpack: {
    plugins: [new ProvidePlugin({ process: 'process' })],
    resolve: {
      alias: {
        '@': resolve('src')
      },
      fallback: {
        // assert: require.resolve('assert/'),
        // util: require.resolve('util/'),
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
