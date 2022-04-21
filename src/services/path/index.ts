/**
 * 环境变量中的host
 *
 * @private
 * @description
 * 以后可能还会把/api写入，但目前先这样
 */
const HOST = VUE_APP_API_SERVER

/**
 * 路由表
 *
 * @public
 * @description
 * Q: 为什么要汇总这样一份全量、不带拼接的路由表？
 * A: 方便查看bug报告时用单子里的url直接快速反查到节点，然后一路F12找到业务调用点；
 *    假设经过多次拼接，则需要慢慢拆解业务，找被划分过的文件，看是谁调用的
 *
 * Q: 这么大的路由表都写在一起不就拆不开了？
 * A: 一般项目的路由表就算量上去了，gzip后的体积也还是不值一提；
 *    假设有解冲突的需求，也可以在文件夹内进行按域拆分定义，只要前提保证依然是全量书写path就可以
 *
 * Q: 定义里类似 ----- user ----- 的注释是必要的吗？用意？
 * A: 有意义的，用来协助git进行分区diff；大文件的共同编辑必然要考虑解冲突，
 *    通过定义格式相对独立、换行的注释起点和终点有助于git按照注释进行diff划分，降低冲突几率，简化解冲压力；
 *    当然了，如果以后通过文件来进行拆分，就可以不用这样了，
 *    但是现在项目还不大，不拆的话简化编辑也是个不错的选择
 */
export const PATH = {
  /** ----- user ----- */
  USER_LOGIN: `${HOST}/api/user/login`,
  USER_REFRESH_TOKEN: `${HOST}/api/user/refresh_token`,
  USER_SEND_RESET_EMAIL: `${HOST}/api/user/send_reset_email`,
  USER_SEND_REGISTER_EMAIL: `${HOST}/api/user/send_register_email`,
  USER_RESET_PASSWORD: `${HOST}/api/user/reset_password`,
  USER_REGISTER: `${HOST}/api/user/register`,
  USER_UPLOAD_BOOK: `${HOST}/api/user/upload_book`
  /** ----- end user ----- */

  /** ----- book ----- */
  /** ----- end book ----- */
}
