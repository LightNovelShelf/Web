import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    redirect: 'Home'
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
    path: '/Book',
    name: 'Book',
    component: () => import('../views/Book.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
