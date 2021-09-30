module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        // @url https://github.com/facebook/create-react-app/pull/8526/files
        // 简单说就是浏览器支持 ?? ?. 操作符但webpack的解析引擎还没支持，所以这两个 proposal 一定要include
        include: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator']
      }
    ]
  ]
}
