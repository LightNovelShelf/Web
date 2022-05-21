/** 配置env并返回配置后内容 */
module.exports.configEnv = function configEnv() {
  const env = {
    ...require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}.local` }).parsed,
    ...require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` }).parsed,
    ...require('dotenv').config().parsed
  }

  return env
}
