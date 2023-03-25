import { RouteRecordRaw } from 'vue-router'

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
    path: '/book/edit/:bid',
    name: 'EditBook',
    props: true,
    component: () => import('../views/Book/EditInfo.vue')
  },
  {
    path: '/book/edit/chapter/:bid/:sortNum',
    name: 'EditChapter',
    props: true,
    component: () => import('../views/Book/EditChapter.vue')
  },
  {
    path: '/book/rank/:type',
    name: 'BookRank',
    props: true,
    component: () => import('../views/Book/BookRank.vue')
  },
  {
    path: '/read/:bid/:sortNum',
    name: 'Read',
    props: true,
    component: () => import('../views/Book/Read/Read.vue')
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
    meta: { requiresAuth: false },
    component: () => import('../views/Setting.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/User/Profile.vue')
  },
  {
    path: '/user/publish',
    name: 'UserPublish',
    component: () => import('../views/User/Publish.vue')
  },
  {
    path: '/user/bookEditor/:bookId',
    name: 'UserBookEditor',
    props: true,
    component: () => import('../views/User/BookEditor.vue')
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
  },
  {
    path: '/forum/list',
    name: 'ForumList',
    props: true,
    component: () => import('../views/Forum/List/index.vue')
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    props: true,
    component: () => import('../views/Forum/index.vue')
  }
]

export default routes
