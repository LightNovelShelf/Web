import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    redirect: { name: 'BookList' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/announcement',
    name: 'Announcement',
    component: () => import('../views/Announcement.vue')
  },
  {
    path: '/booklist/:page?',
    name: 'BookList',
    props: true,
    component: () => import('../views/BookList.vue')
  },
  {
    path: '/bookinfo/:bid',
    name: 'BookInfo',
    props: true,
    component: () => import('../views/BookInfo.vue')
  },
  {
    path: '/collaborator',
    name: 'Collaborator',
    component: () => import('../views/Collaborator/List.vue')
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

export default router
