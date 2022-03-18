import { route } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { longTermToken, sessionToken } from 'src/utils/session'
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from './routes'
import { nanoid } from 'nanoid'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default route(function (/* { store, ssrContext } */) {
  const keys = []

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? (baseUrl) => {
        const history = createWebHistory(baseUrl)
        const _push = history.push
        const _replace = history.replace
        const setKey = (to, data) => {
          if (!data) data = {}
          data['key'] = `[${to}] ${nanoid()}`
          keys.push(data['key'])
          return data
        }
        history.push = (to, data) => {
          data = setKey(to, data)
          _push(to, data)
        }
        history.replace = (to, data) => {
          data = setKey(to, data)
          _replace(to, data)
        }
        return history
      }
    : createWebHashHistory

  const router = createRouter({
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  router.beforeEach(async function (to) {
    if (to.params.authRedirect) {
      Notify.create({
        type: 'negative',
        timeout: 1500,
        position: 'bottom',
        message: '此操作必须登录，正在前往登录页面'
      })
    }

    // 显式声明不需要授权
    if (to.meta.requiresAuth === false) {
      return
    }

    // 检查有没有授权所需的材料
    if (sessionToken.get() || (await longTermToken.get())) {
      // 有材料就算过，授权失败等情况由其它地方保证
      return
    }

    if (!to.params.authRedirect) {
      Notify.create({
        type: 'negative',
        timeout: 1500,
        position: 'bottom',
        message: '此页面必须登录'
      })
    }

    // 没有授权材料，跳转到登录页
    return { name: 'Login', query: { from: encodeURIComponent(to.fullPath) } }
  })

  const readyRoute = []
  router.afterEach((to) => {
    const key = history.state['key']
    if (readyRoute.includes(to.name)) {
      if (key) {
        to.meta.reload = keys.findIndex((item) => item === key) === keys.length - 1
      } else {
        to.meta.reload = false
      }
    } else {
      readyRoute.push(to.name)
      to.meta.reload = true
    }
  })

  return router
})
