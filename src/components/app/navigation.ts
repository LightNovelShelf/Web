import type { RouteLocationRaw } from 'vue-router'

interface NavigationBase {
  key: string
  label: string
  icon: string
}

export interface RouteNavigationItem extends NavigationBase {
  kind: 'route'
  to: RouteLocationRaw
}

interface ExternalNavigationItem extends NavigationBase {
  kind: 'external'
  href: string
}

interface NavigationSeparator {
  kind: 'separator'
  key: string
}

export type SidebarNavigationItem = RouteNavigationItem | ExternalNavigationItem | NavigationSeparator

export const sidebarNavigation: SidebarNavigationItem[] = [
  { kind: 'route', key: 'Home', label: '首页', icon: 'mdiHome', to: { name: 'Home' } },
  { kind: 'route', key: 'Announcement', label: '公告', icon: 'mdiBullhorn', to: { name: 'Announcement' } },
  { kind: 'separator', key: 'separator-content' },
  {
    kind: 'route',
    key: 'BookList',
    label: '全部小说',
    icon: 'mdiBook',
    to: { name: 'BookList', params: { order: 'latest', page: '1' } },
  },
  {
    kind: 'route',
    key: 'MangaDiscover',
    label: '全部漫画',
    icon: 'mdiImage',
    to: { name: 'MangaDiscover', params: { order: 'latest', page: '1' } },
  },
  {
    kind: 'route',
    key: 'BookRank',
    label: '近期排行',
    icon: 'mdiFire',
    to: { name: 'BookRank', params: { type: 'weekly' } },
  },
  { kind: 'route', key: 'MyShelf', label: '我的书架', icon: 'mdiFolderHeartOutline', to: { name: 'MyShelf' } },
  { kind: 'separator', key: 'separator-personal' },
  { kind: 'route', key: 'Community', label: '社区', icon: 'mdiForum', to: { name: 'ForumList' } },
  { kind: 'route', key: 'History', label: '阅读历史', icon: 'mdiHistory', to: { name: 'History' } },
  { kind: 'route', key: 'Shop', label: '商城', icon: 'mdiStorefrontOutline', to: { name: 'Shop' } },
  { kind: 'separator', key: 'separator-site' },
  { kind: 'route', key: 'Setting', label: '设置', icon: 'mdiCog', to: { name: 'Setting' } },
  {
    kind: 'route',
    key: 'Collaborator',
    label: '贡献列表',
    icon: 'mdiAccountMultiple',
    to: { name: 'Collaborator' },
  },
  {
    kind: 'external',
    key: 'Sponsor',
    label: '赞助本站',
    icon: 'mdiHeartOutline',
    href: 'https://www.ifdian.net/a/wuyu8512',
  },
]

export const accountNavigation: RouteNavigationItem[] = [
  { kind: 'route', key: 'Account', label: '个人中心', icon: 'mdiAccountOutline', to: { name: 'UserProfile' } },
  { kind: 'route', key: 'DirectMessage', label: '我的私信', icon: 'mdiMessageText', to: { name: 'DirectMessage' } },
  { kind: 'route', key: 'Contribution', label: '发布管理', icon: 'mdiAccountCog', to: { name: 'UserPublish' } },
  { kind: 'route', key: 'MyShelf', label: '我的书架', icon: 'mdiFolderHeartOutline', to: { name: 'MyShelf' } },
  { kind: 'route', key: 'Shop', label: '商城', icon: 'mdiStorefrontOutline', to: { name: 'Shop' } },
  { kind: 'route', key: 'ForumMine', label: '我的社区', icon: 'mdiAccountBoxOutline', to: { name: 'ForumMine' } },
  { kind: 'route', key: 'Setting', label: '网站设置', icon: 'mdiCog', to: { name: 'Setting' } },
]
