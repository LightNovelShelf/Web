import type {
  CommunityActiveUserItem,
  CommunityBoardKey,
  CommunityBoardSummary,
  CommunityFeedItem,
  CommunityFeedOrder,
  CommunityFeedScope,
  CommunityHomePayload,
  CommunityHotRankItem,
  CommunityThreadDetail,
  CommunityThreadReply,
  CreateCommunityThreadRequest,
  GetCommunityHomePayloadRequest,
} from './types'

const boards: CommunityBoardSummary[] = [
  { id: 0, key: 'all', title: '全部讨论', description: '一眼看到今天最热和最新的社区内容', icon: 'mdiForum', todayPosts: 42, heatLabel: '热度 8.6k' },
  { id: 1, key: 'anime', title: '动画', description: '新番、作画、剧情考据和角色讨论', icon: 'mdiVideo', todayPosts: 12, heatLabel: '热度 2.4k' },
  { id: 2, key: 'comic', title: '漫画', description: '连载追更、分镜表现和作者杂谈', icon: 'mdiImage', todayPosts: 8, heatLabel: '热度 1.8k' },
  { id: 3, key: 'game', title: '游戏', description: 'Gal、JRPG、抽卡玩法和剧情线讨论', icon: 'mdiController', todayPosts: 9, heatLabel: '热度 2.1k' },
  { id: 4, key: 'novel', title: '小说', description: '轻小说、网文和章节更新的读后感', icon: 'mdiBook', todayPosts: 14, heatLabel: '热度 3.2k' },
  { id: 5, key: 'website', title: '站务', description: '功能建议、站点反馈和社区活动公告', icon: 'mdiBullhorn', todayPosts: 3, heatLabel: '热度 0.9k' },
]

const seedFeed: CommunityFeedItem[] = [
  {
    id: 101,
    boardKey: 'anime',
    boardName: '动画',
    title: '四月新番里最值得追更的三部作品，大家目前最看好哪一部？',
    excerpt: '从第一集演出到原作改编节奏都很稳，目前讨论热度最高的还是两部校园向作品，但这季真正的黑马可能是那部开局不太起眼的群像剧。',
    authorName: '白露',
    authorAvatar: 'https://i.pravatar.cc/96?img=5',
    publishedAt: '18 分钟前',
    replies: 38,
    views: 1480,
    heat: 97,
    tags: ['新番', '追更', '安利'],
    pinned: true,
  },
  {
    id: 102,
    boardKey: 'novel',
    boardName: '小说',
    title: '这本恋爱轻小说的后半段节奏突然提速，你们觉得是优点还是缺点？',
    excerpt: '前四卷都是日常铺陈，第五卷开始连续推进主线，有人觉得终于进入正题，也有人觉得失去了前面慢热铺垫的味道。',
    authorName: '纸鸢',
    authorAvatar: 'https://i.pravatar.cc/96?img=12',
    publishedAt: '42 分钟前',
    replies: 56,
    views: 2330,
    heat: 94,
    tags: ['轻小说', '剧情节奏'],
    featured: true,
  },
  {
    id: 103,
    boardKey: 'website',
    boardName: '站务',
    title: '社区首页原型第一版开放讨论，欢迎集中反馈排版、阅读密度和功能优先级',
    excerpt: '这次会先把 PC 社区首页做成内容优先的结构，移动端后续单独适配。希望大家重点聊三个问题：左侧板块是否清晰、中间帖子流是否顺手、右侧榜单是否有用。',
    authorName: '站务娘',
    authorAvatar: 'https://i.pravatar.cc/96?img=32',
    publishedAt: '1 小时前',
    replies: 24,
    views: 890,
    heat: 88,
    tags: ['公告', '收集反馈'],
    pinned: true,
    locked: true,
  },
  {
    id: 104,
    boardKey: 'game',
    boardName: '游戏',
    title: '最近有哪些剧情体验很强但讨论度还不够高的日式游戏？',
    excerpt: '不是单纯推荐大作，更想找一些剧情完整、角色塑造足、玩完会想写长评的作品，平台不限。',
    authorName: '七海',
    authorAvatar: 'https://i.pravatar.cc/96?img=15',
    publishedAt: '2 小时前',
    replies: 29,
    views: 1024,
    heat: 82,
    tags: ['剧情向', '求推荐'],
  },
  {
    id: 105,
    boardKey: 'comic',
    boardName: '漫画',
    title: '这部作品的分镜看着平静，但情绪推进非常狠，适合做一次完整拆解',
    excerpt: '很多人第一次看会觉得对白不多、节奏不快，但它在跨页、留白和角色视线的处理上非常成熟，越回味越能看到设计。',
    authorName: '折木',
    authorAvatar: 'https://i.pravatar.cc/96?img=18',
    publishedAt: '3 小时前',
    replies: 18,
    views: 760,
    heat: 71,
    tags: ['分镜', '长评'],
    featured: true,
  },
  {
    id: 106,
    boardKey: 'novel',
    boardName: '小说',
    title: '如果社区增加书单共读功能，你最希望它先解决哪种阅读体验问题？',
    excerpt: '我个人最想要的是按章节串联讨论，其次是书单里能直接看到更新节奏和已读进度，这样跟读体验会比现在顺很多。',
    authorName: '花镜',
    authorAvatar: 'https://i.pravatar.cc/96?img=20',
    publishedAt: '今天 09:20',
    replies: 41,
    views: 1210,
    heat: 79,
    tags: ['产品建议', '共读'],
  },
  {
    id: 107,
    boardKey: 'anime',
    boardName: '动画',
    title: '这条标题故意做得很长，用来验证社区首页帖子流在桌面端的两行截断和信息层级是否稳定且仍然保持阅读舒适度',
    excerpt: '长标题场景下，帖子摘要应该自然退到第二层，不应该把回复数和板块标签挤压到难以扫描的位置。',
    authorName: '小春',
    authorAvatar: 'https://i.pravatar.cc/96?img=24',
    publishedAt: '今天 08:05',
    replies: 12,
    views: 540,
    heat: 64,
    tags: ['布局测试', '长标题'],
  },
  {
    id: 108,
    boardKey: 'game',
    boardName: '游戏',
    title: 'Galgame 里最打动你的告白场景是哪一段？',
    excerpt: '不限经典还是新作，只要是你现在还能复述出镜头和配乐的那一段都算。欢迎带原因，不必担心剧透格式，我来整理。',
    authorName: '流火',
    authorAvatar: 'https://i.pravatar.cc/96?img=28',
    publishedAt: '昨天',
    replies: 67,
    views: 3044,
    heat: 91,
    tags: ['Galgame', '名场面'],
  },
  {
    id: 109,
    boardKey: 'comic',
    boardName: '漫画',
    title: '有没有那种每次更新都想暂停几分钟回味结尾页面的连载？',
    excerpt: '',
    authorName: '荷叶',
    authorAvatar: 'https://i.pravatar.cc/96?img=30',
    publishedAt: '昨天',
    replies: 22,
    views: 980,
    heat: 68,
    tags: ['追更', '求安利'],
  },
  {
    id: 110,
    boardKey: 'website',
    boardName: '站务',
    title: '反馈收集：你最希望右侧榜单新增什么信息维度？',
    excerpt: '我们正在评估“本周涨幅”“新晋活跃用户”和“版主推荐”这几类榜单形态，欢迎只选一个最有价值的方向。',
    authorName: '管理员',
    authorAvatar: 'https://i.pravatar.cc/96?img=33',
    publishedAt: '昨天',
    replies: 15,
    views: 412,
    heat: 52,
    tags: ['站务', '调研'],
  },
]

const activeUsers: CommunityActiveUserItem[] = [
  { id: 1, name: '阿澄', avatar: 'https://i.pravatar.cc/96?img=41', badge: '周活跃作者', score: 1280, summary: '本周发布 6 篇长评' },
  { id: 2, name: '玲珑', avatar: 'https://i.pravatar.cc/96?img=44', badge: '追更达人', score: 1120, summary: '连续 12 天参与讨论' },
  { id: 3, name: '弥生', avatar: 'https://i.pravatar.cc/96?img=47', badge: '小说区常驻', score: 1030, summary: '贡献 54 条高赞回复' },
  { id: 4, name: '一木', avatar: 'https://i.pravatar.cc/96?img=49', badge: '动画区版主', score: 980, summary: '整理 3 个集中讨论帖' },
  { id: 5, name: '澪', avatar: 'https://i.pravatar.cc/96?img=52', badge: '新人观察员', score: 860, summary: '本周新增 18 个收藏' },
]

const threadReplies: Record<number, CommunityThreadReply[]> = {
  101: [
    { id: 1, authorName: '空白页', authorBadge: '动画区常驻', publishedAt: '8 分钟前', content: '我会先押那部群像剧，第一集信息量很大，但镜头组织非常稳。', likes: 24, liked: false },
    { id: 2, authorName: '微光', authorBadge: '追番达人', publishedAt: '4 分钟前', content: '校园向那两部观感更好入口，但黑马相其实已经有了。', likes: 12, liked: false },
  ],
  102: [
    { id: 3, authorName: '折返线', authorBadge: '小说区常驻', publishedAt: '15 分钟前', content: '我更喜欢后半段提速，不然前面的关系推进会显得太松。', likes: 19, liked: false },
    { id: 4, authorName: '白川', publishedAt: '6 分钟前', content: '问题不是提速，而是情绪回收不够细，所以会觉得断层。', likes: 9, liked: false },
  ],
}

const customThreads: CommunityThreadDetail[] = []

function getBoard(boardKey: CommunityBoardKey) {
  return boards.find((board) => board.key === boardKey)
}

function getFeedSource() {
  return [
    ...customThreads.map(threadToFeedItem),
    ...seedFeed,
  ]
}

function threadToFeedItem(thread: CommunityThreadDetail): CommunityFeedItem {
  return {
    id: thread.id,
    boardKey: thread.boardKey,
    boardName: thread.boardName,
    title: thread.title,
    excerpt: thread.excerpt,
    authorName: thread.authorName,
    authorAvatar: `https://i.pravatar.cc/96?u=community-${thread.id}`,
    publishedAt: thread.publishedAt,
    replies: thread.replies,
    views: thread.views,
    heat: thread.heat,
    tags: thread.tags,
    featured: thread.featured,
    pinned: thread.pinned,
    locked: thread.locked,
  }
}

function sortFeed(items: CommunityFeedItem[], order: CommunityFeedOrder) {
  const cloned = [...items]
  if (order === 'hot') return cloned.sort((a, b) => b.heat - a.heat)
  if (order === 'featured') {
    return cloned.sort((a, b) => Number(b.pinned || b.featured) - Number(a.pinned || a.featured) || b.heat - a.heat)
  }

  return cloned.sort((a, b) => {
    const aWeight = Number(a.pinned) * 1000 + Number(a.featured) * 100
    const bWeight = Number(b.pinned) * 1000 + Number(b.featured) * 100
    return bWeight - aWeight || b.heat - a.heat
  })
}

function filterByScope(items: CommunityFeedItem[], scope: CommunityFeedScope) {
  if (scope === 'today') {
    return items.filter((item) => item.publishedAt.includes('今天') || item.publishedAt.includes('分钟') || item.publishedAt.includes('小时') || item.publishedAt.includes('刚刚'))
  }
  if (scope === 'week') {
    return items.filter((item) => !item.publishedAt.includes('上周'))
  }
  return items
}

function buildHotThreads(items: CommunityFeedItem[]): CommunityHotRankItem[] {
  return [...items]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id,
      title: item.title,
      boardName: item.boardName,
      heat: item.heat * 10 + item.replies,
      deltaLabel: index < 3 ? '上升中' : '讨论稳定',
    }))
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function buildBodyHtml(paragraphs: string[]) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

function htmlToParagraphs(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function inferTags(boardKey: Exclude<CommunityBoardKey, 'all'>, title: string, paragraphs: string[]) {
  const tags: string[] = []
  const plain = `${title} ${paragraphs.join(' ')}`.toLowerCase()
  const boardTitle = getBoard(boardKey)?.title

  if (boardTitle) {
    tags.push(boardTitle)
  }

  if (/[？?]|为什么|如何|怎么|求/.test(title)) {
    tags.push('提问')
  }

  if (/安利|推荐|入坑|补番/.test(plain)) {
    tags.push('安利')
  }

  if (/分析|复盘|长评|拆解|评价/.test(plain)) {
    tags.push('长评')
  }

  if (boardKey === 'anime' && /新番|作画|追更/.test(plain)) tags.push('新番')
  if (boardKey === 'comic' && /分镜|连载/.test(plain)) tags.push('分镜')
  if (boardKey === 'game' && /剧情|gal|jrpg/.test(plain)) tags.push('剧情向')
  if (boardKey === 'novel' && /轻小说|章节|共读/.test(plain)) tags.push('轻小说')
  if (boardKey === 'website' && /反馈|建议|功能/.test(plain)) tags.push('站务')

  return [...new Set(tags)].slice(0, 4)
}

function buildMockBody(current: CommunityFeedItem) {
  const paragraphs = [
    `${current.excerpt || '这是一条来自社区首页的示例帖子详情，用来承接从帖子流进入具体页面的阅读路径。'} 详情页会优先保留标题、板块、作者和互动信息，让用户确认自己点进来的就是同一篇帖子。`,
    '第二段用于模拟正文展开后的阅读节奏。这里通常会放作者的完整观点、举例、背景说明，以及和楼内讨论相关的上下文信息。',
    '这版先使用 mock 数据完成交互闭环，后续接真实接口时只需要把详情查询替换到数据层，不需要改路由和页面结构。',
  ]

  return {
    body: paragraphs,
    bodyHtml: [
      '<p><strong>正文示例</strong></p>',
      buildBodyHtml(paragraphs),
      '<blockquote><p>这版先用 HtmlReader 渲染帖子内容，后续接真实富文本时可以直接替换数据源。</p></blockquote>',
    ].join(''),
  }
}

export async function getCommunityHomePayload(
  req: GetCommunityHomePayloadRequest = {},
): Promise<CommunityHomePayload> {
  const order = req.order ?? 'latest'
  const scope = req.scope ?? 'all'
  const boardKey = req.boardKey ?? 'all'
  const allItems = getFeedSource()
  const boardFiltered = boardKey === 'all' ? allItems : allItems.filter((item) => item.boardKey === boardKey)
  const orderedFeed = sortFeed(filterByScope(boardFiltered, scope), order)

  await new Promise((resolve) => setTimeout(resolve, 180))

  return {
    title: '社区讨论中心',
    subtitle: '围绕动画、漫画、游戏、小说和站内话题展开更轻量的交流。',
    announcement: '社区首页原型已开放，欢迎从“站务”板块集中反馈体验问题。',
    announcementLink: '/forum/5',
    todayThreads: boards.reduce((sum, board) => sum + board.todayPosts, 0) + customThreads.length,
    onlineUsers: 286,
    boards,
    feed: orderedFeed,
    hotThreads: buildHotThreads(allItems),
    activeUsers,
  }
}

export async function getCommunityThreadDetail(id: number): Promise<CommunityThreadDetail | null> {
  const customThread = customThreads.find((item) => item.id === id)
  if (customThread) {
    return {
      ...customThread,
      relatedThreads: getFeedSource()
        .filter((item) => item.id !== id && item.boardKey === customThread.boardKey)
        .slice(0, 3),
    }
  }

  const current = seedFeed.find((item) => item.id === id)
  if (!current) {
    return null
  }

  const body = buildMockBody(current)

  await new Promise((resolve) => setTimeout(resolve, 120))

  return {
    ...current,
    likes: Math.max(18, Math.round(current.heat * 1.6 + current.replies / 2)),
    favorites: Math.max(6, Math.round(current.heat * 0.7 + current.replies / 3)),
    liked: false,
    favorited: false,
    body: body.body,
    bodyHtml: body.bodyHtml,
    repliesPreview: threadReplies[id] ?? [
      { id: 1000 + id, authorName: '示例用户', publishedAt: '刚刚', content: '这条回复是默认占位，用于验证详情页在回复较少时的样式。', likes: 3, liked: false },
    ],
    relatedThreads: getFeedSource()
      .filter((item) => item.id !== id && item.boardKey === current.boardKey)
      .slice(0, 3),
  }
}

export async function createCommunityThread(req: CreateCommunityThreadRequest): Promise<CommunityThreadDetail> {
  const board = getBoard(req.boardKey)
  const paragraphs = htmlToParagraphs(req.contentHtml)
  const excerpt = (paragraphs[0] ?? req.title).slice(0, 120)
  const nowId = Date.now()

  const created: CommunityThreadDetail = {
    id: nowId,
    boardKey: req.boardKey,
    boardName: board?.title ?? '社区',
    title: req.title.trim(),
    excerpt,
    authorName: req.authorName,
    publishedAt: '刚刚',
    replies: 0,
    views: 1,
    heat: 18,
    likes: 0,
    favorites: 0,
    tags: inferTags(req.boardKey, req.title, paragraphs),
    liked: false,
    favorited: false,
    body: paragraphs,
    bodyHtml: req.contentHtml,
    repliesPreview: [],
    relatedThreads: [],
  }

  customThreads.unshift(created)
  await new Promise((resolve) => setTimeout(resolve, 160))
  return created
}
