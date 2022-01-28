import { longTermToken, sessionToken } from '@/utils/session'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { Notify } from 'quasar'
import { nanoid } from 'nanoid'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    meta: { requiresAuth: false },
    redirect: { name: 'Home' }
  },
  {
    path: '/home',
    name: 'Home',
    meta: { requiresAuth: false },
    component: () => import('../views/Home.vue')
  },
  {
    path: '/announcement',
    name: 'Announcement',
    meta: { requiresAuth: false },
    component: () => import('../views/Announcement/Announcement.vue')
  },
  {
    path: '/announcement/detail/:id',
    name: 'AnnouncementDetail',
    props: true,
    meta: { requiresAuth: false },
    component: () => import('../views/Announcement/AnnouncementDetail.vue')
  },
  {
    path: '/book/list/:order/:page?',
    name: 'BookList',
    props: true,
    component: () => import('../views/Book/BookList.vue')
  },
  {
    path: '/book/info/:bid',
    name: 'BookInfo',
    props: true,
    component: () => import('../views/Book/BookInfo.vue')
  },
  {
    path: '/read/:bid/:sortNum',
    name: 'Read',
    props: true,
    component: () => import('../views/Read.vue')
  },
  {
    path: '/collaborator',
    name: 'Collaborator',
    meta: { requiresAuth: false },
    component: () => import('../views/Collaborator/List.vue')
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('../views/Setting.vue')
  },
  {
    path: '/test',
    name: 'Test',
    meta: { requiresAuth: false },
    component: () => import('../views/Test.vue')
  },
  {
    path: '/',
    meta: { requiresAuth: false },
    component: () => import('../views/Login/Index.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        meta: { requiresAuth: false },
        component: () => import('../views/Login/Login.vue')
      },
      {
        path: 'reset',
        name: 'Reset',
        meta: { requiresAuth: false },
        component: () => import('../views/Login/Reset.vue')
      },
      {
        path: 'register',
        name: 'Register',
        meta: { requiresAuth: false },
        component: () => import('../views/Login/Register.vue')
      }
    ]
  },
  {
    path: '/my-shelf/:folderID*',
    name: 'MyShelf',
    // 书架需要获取书本信息，书本信息接口是一个授权接口
    // meta: { requiresAuth: false },
    component: () => import('../views/MyShelf/List.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  },
  {
    path: '/search/:keyWords?',
    name: 'Search',
    props: true,
    component: () => import('../views/Search.vue')
  }
]

export const keys = []
const history = createWebHistory(process.env.BASE_URL)
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

const router = createRouter({
  history: history,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
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

export default router
