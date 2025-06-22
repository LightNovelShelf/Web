import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'App',
    meta: { requiresAuth: false },
    redirect: { name: 'Home' },
  },
  {
    path: '/home',
    name: 'Home',
    meta: { requiresAuth: false },
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/announcement',
    name: 'Announcement',
    meta: { requiresAuth: false },
    component: () => import('../pages/Announcement/Announcement.vue'),
  },
  {
    path: '/announcement/detail/:id',
    name: 'AnnouncementDetail',
    props: true,
    meta: { requiresAuth: false },
    component: () => import('../pages/Announcement/AnnouncementDetail.vue'),
  },
  {
    path: '/book/list/:order/:page?',
    name: 'BookList',
    props: true,
    component: () => import('../pages/Book/BookList.vue'),
  },
  {
    path: '/book/info/:bid',
    name: 'BookInfo',
    props: true,
    component: () => import('../pages/Book/BookInfo.vue'),
  },
  {
    path: '/book/edit/:bid',
    name: 'EditBook',
    props: true,
    component: () => import('../pages/Book/EditInfo.vue'),
  },
  {
    path: '/book/edit/chapter/:bid/:sortNum',
    name: 'EditChapter',
    props: true,
    component: () => import('../pages/Book/EditChapter.vue'),
  },
  {
    path: '/book/rank/:type',
    name: 'BookRank',
    props: true,
    component: () => import('../pages/Book/BookRank.vue'),
  },
  {
    path: '/read/:bid/:sortNum',
    name: 'Read',
    props: true,
    component: () => import('../pages/Book/Read/Read.vue'),
  },
  {
    path: '/collaborator',
    name: 'Collaborator',
    meta: { requiresAuth: false },
    component: () => import('../pages/Collaborator/List.vue'),
  },
  {
    path: '/setting',
    name: 'Setting',
    meta: { requiresAuth: false },
    component: () => import('../pages/Setting.vue'),
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../pages/User/Profile.vue'),
  },
  {
    path: '/user/publish',
    name: 'UserPublish',
    component: () => import('../pages/User/Publish.vue'),
  },
  {
    path: '/user/bookEditor/:bookId',
    name: 'UserBookEditor',
    props: true,
    component: () => import('../pages/User/BookEditor.vue'),
  },
  {
    path: '/test',
    name: 'Test',
    meta: { requiresAuth: false },
    component: () => import('../pages/Test.vue'),
  },
  {
    path: '/',
    meta: { requiresAuth: false },
    component: () => import('../pages/Login/Index.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        meta: { requiresAuth: false },
        component: () => import('../pages/Login/Login.vue'),
      },
      {
        path: 'reset',
        name: 'Reset',
        meta: { requiresAuth: false },
        component: () => import('../pages/Login/Reset.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        meta: { requiresAuth: false },
        component: () => import('../pages/Login/Register.vue'),
      },
    ],
  },
  {
    path: '/my-shelf/:folderID*',
    name: 'MyShelf',
    // 书架需要获取书本信息，书本信息接口是一个授权接口
    // meta: { requiresAuth: false },
    component: () => import('../pages/MyShelf/List.vue'),
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../pages/History.vue'),
  },
  {
    /** @query {{ keywords?: string, exact?: string }} */
    path: '/search/result',
    name: 'Search',
    props: true,
    component: () => import('../pages/Search.vue'),
  },
  {
    path: '/forum/list',
    name: 'ForumList',
    props: true,
    component: () => import('../pages/Forum/List/index.vue'),
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    props: true,
    component: () => import('../pages/Forum/index.vue'),
  },
]

export default routes
