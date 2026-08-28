import { nanoid } from 'nanoid'
import { Notify } from 'quasar'
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import { longTermToken, sessionToken } from '@/utils/session'

import { defineRouter } from '#q-app'

import routes from './routes'

import type { HistoryState, RouteRecordNameGeneric } from 'vue-router'

const localApiServerStorageKey = `${import.meta.env.VUE_APP_NAME || 'LightNovelShelf'}_Api_Server_V7`

function canBypassAuthForLocalCommunity(to: { name?: RouteRecordNameGeneric }) {
  if (!import.meta.env.QUASAR_DEV || import.meta.env.QUASAR_SERVER || to.name !== 'UserProfile') {
    return false
  }

  const selectedApiServer = window.localStorage.getItem(localApiServerStorageKey) || 'http://localhost:5204'
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(selectedApiServer)
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default defineRouter(function (/* { store, ssrContext } */) {
  const keys: string[] = []

  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? (baseUrl?: string) => {
          const history = createWebHistory(baseUrl)
          const _push = history.push.bind(history)
          const _replace = history.replace.bind(history)
          const setKey = (to: string, data?: HistoryState) => {
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

  const Router = createRouter({
    scrollBehavior(to, from, savedPosition) {
      // Read 页面的滚动历史由页面自己处理
      if (to.name !== 'Read' && to.name !== 'MangaReader') {
        // 通知跳转带回复锚点时，帖子页自己定位到目标楼层，路由不要再滚回顶部
        if (to.name === 'ForumThread' && to.query.replyId) {
          return false
        }

        if (savedPosition) {
          return savedPosition
        } else {
          // 同一路由仅更新 query / params 时，保留当前位置，避免筛选场景被强制滚到顶部
          if (to.name === from.name && to.path === from.path) {
            return false
          }

          return { top: 0 }
        }
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  Router.beforeEach(async function (to) {
    if (to.params.authRedirect) {
      Notify.create({
        type: 'negative',
        timeout: 1500,
        position: 'bottom',
        message: '此操作必须登录，正在前往登录页面',
      })
    }

    // 显式声明不需要授权
    if (to.meta.requiresAuth === false) {
      return
    }

    if (canBypassAuthForLocalCommunity(to)) {
      return
    }

    // 检查有没有授权所需的材料
    if (sessionToken.get() || (await longTermToken.get())) {
      // 有材料就算过，授权失败等情况由其它地方保证
      return
    }
    return { name: 'Login', query: { from: encodeURIComponent(to.fullPath) } }
  })

  const readyRoute: RouteRecordNameGeneric[] = []
  Router.afterEach((to) => {
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

  return Router
})
