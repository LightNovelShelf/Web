import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    redirect: 'bookinfo'
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
    path: '/bookinfo',
    name: 'BookInfo',
    component: () => import('../views/BookInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
