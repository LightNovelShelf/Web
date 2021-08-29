import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    redirect: 'BookInfo'
  },
  {
    path: '/Home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/Announcement',
    name: 'Announcement',
    component: () => import('../views/Announcement.vue')
  },
  {
    path: '/BookList',
    name: 'BookList',
    component: () => import('../views/BookList.vue')
  },
  {
    path: '/BookInfo',
    name: 'BookInfo',
    component: () => import('../views/BookInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
