const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  productionSourceMap: false,

  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
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
