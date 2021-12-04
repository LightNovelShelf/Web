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
    component: () => import('../views/Announcement/Announcement.vue')
  },
  {
    path: '/announcement/detail/:id',
    name: 'AnnouncementDetail',
    props: true,
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
    component: () => import('../views/Collaborator/List.vue')
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('../views/Test.vue')
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
