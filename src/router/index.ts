import { longTermToken, sessionToken } from '@/utils/session'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { Notify } from 'quasar'

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
    meta: { requiresAuth: false },
    component: () => import('../views/Announcement/AnnouncementDetail.vue')
  },
  {
    path: '/book/list/:page?',
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
    path: '/login',
    name: 'Login',
    meta: { requiresAuth: false },
    component: () => import('../views/Login/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
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

export default router
